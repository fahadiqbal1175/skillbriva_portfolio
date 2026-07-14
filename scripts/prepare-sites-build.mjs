import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(root, "dist");
const serverFile = resolve(root, "dist/server/index.js");
const hostingSource = resolve(root, ".openai/hosting.json");
const hostingTarget = resolve(root, "dist/.openai/hosting.json");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "server" || entry.name === ".openai") continue;
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function routePath(filePath) {
  return `/${relative(distRoot, filePath).split(sep).join("/")}`;
}

function nodeContentType(filePath) {
  return contentTypes[extname(filePath)] || "application/octet-stream";
}

const embeddedAssets = {};
for (const filePath of await walk(distRoot)) {
  embeddedAssets[routePath(filePath)] = {
    contentType: nodeContentType(filePath),
    body: (await readFile(filePath)).toString("base64")
  };
}

const workerSource = `const INDEX_PATH = "/index.html";
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};
const EMBEDDED_ASSETS = ${JSON.stringify(embeddedAssets)};

function isAssetPath(pathname) {
  return pathname.startsWith("/assets/") || pathname.startsWith("/resources/");
}

function contentType(pathname) {
  const extension = pathname.includes(".") ? pathname.slice(pathname.lastIndexOf(".")) : "";
  return CONTENT_TYPES[extension] || "application/octet-stream";
}

function decodeBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function serveEmbedded(pathname) {
  const asset = EMBEDDED_ASSETS[pathname];
  if (!asset) return new Response("Not found", { status: 404 });
  return new Response(decodeBase64(asset.body), {
    headers: {
      "Content-Type": asset.contentType || contentType(pathname),
      "Cache-Control": isAssetPath(pathname)
        ? "public, max-age=31536000, immutable"
        : "no-cache"
    }
  });
}

function staticContentKey(pathname, env) {
  const cleanPath = pathname.replace(/^\\//, "");
  const manifest = env?.__STATIC_CONTENT_MANIFEST;
  if (!manifest) return cleanPath;
  const entries = typeof manifest === "string" ? JSON.parse(manifest) : manifest;
  return entries[cleanPath] || entries["/" + cleanPath] || cleanPath;
}

async function serveAssetPath(pathname, request, env) {
  const embedded = serveEmbedded(pathname);
  if (embedded.status !== 404) return embedded;

  const assetRequest = new Request(new URL(pathname, request.url), request);
  if (env?.ASSETS?.fetch) {
    return env.ASSETS.fetch(assetRequest);
  }
  if (env?.__STATIC_CONTENT?.get) {
    const key = staticContentKey(pathname, env);
    const body = await env.__STATIC_CONTENT.get(key, "arrayBuffer");
    if (body) {
      return new Response(body, {
        headers: {
          "Content-Type": contentType(pathname),
          "Cache-Control": isAssetPath(pathname)
            ? "public, max-age=31536000, immutable"
            : "no-cache"
        }
      });
    }
  }
  return new Response("Not found", { status: 404 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (isAssetPath(url.pathname)) {
      return serveAssetPath(url.pathname, request, env);
    }

    const response = await serveAssetPath(url.pathname, request, env);
    if (response.status !== 404) {
      return response;
    }

    return serveAssetPath(INDEX_PATH, request, env);
  }
};
`;

await mkdir(dirname(serverFile), { recursive: true });
await mkdir(dirname(hostingTarget), { recursive: true });
await writeFile(serverFile, workerSource);
await copyFile(hostingSource, hostingTarget);

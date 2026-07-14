import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const serverFile = resolve(root, "dist/server/index.js");
const hostingSource = resolve(root, ".openai/hosting.json");
const hostingTarget = resolve(root, "dist/.openai/hosting.json");

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

function isAssetPath(pathname) {
  return pathname.startsWith("/assets/") || pathname.startsWith("/resources/");
}

function contentType(pathname) {
  const extension = pathname.includes(".") ? pathname.slice(pathname.lastIndexOf(".")) : "";
  return CONTENT_TYPES[extension] || "application/octet-stream";
}

function staticContentKey(pathname, env) {
  const cleanPath = pathname.replace(/^\\//, "");
  const manifest = env?.__STATIC_CONTENT_MANIFEST;
  if (!manifest) return cleanPath;
  const entries = typeof manifest === "string" ? JSON.parse(manifest) : manifest;
  return entries[cleanPath] || entries["/" + cleanPath] || cleanPath;
}

async function serveAssetPath(pathname, request, env) {
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

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

const textExtensions = new Set([".html", ".js", ".css", ".svg", ".txt", ".json"]);
const textAssets = [];
const binaryAssets = [];

for (const filePath of await walk(distRoot)) {
  const path = routePath(filePath);
  const type = nodeContentType(filePath);
  if (textExtensions.has(extname(filePath))) {
    textAssets.push([path, [type, await readFile(filePath, "utf8")]]);
  } else {
    binaryAssets.push([path, [type, (await readFile(filePath)).toString("base64")]]);
  }
}

const workerSource = `const textAssets = new Map(${JSON.stringify(textAssets)});
const binaryAssets = new Map(${JSON.stringify(binaryAssets)});

function decodeBase64(base64) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const clean = base64.replace(/=+$/, "");
  const bytes = [];
  let buffer = 0;
  let bitCount = 0;

  for (const character of clean) {
    const number = alphabet.indexOf(character);
    if (number < 0) {
      continue;
    }
    buffer = (buffer << 6) | number;
    bitCount += 6;
    if (bitCount >= 8) {
      bitCount -= 8;
      bytes.push((buffer >> bitCount) & 255);
    }
  }

  return new Uint8Array(bytes);
}

function cacheControl(pathname) {
  return pathname === "/index.html" ? "no-cache" : "public, max-age=31536000, immutable";
}

function responseFor(pathname) {
  const normalizedPath = pathname === "/" ? "/index.html" : pathname;
  const textAsset = textAssets.get(normalizedPath);
  if (textAsset) {
    return new Response(textAsset[1], {
      headers: {
        "content-type": textAsset[0],
        "cache-control": cacheControl(normalizedPath)
      }
    });
  }

  const binaryAsset = binaryAssets.get(normalizedPath);
  if (binaryAsset) {
    return new Response(decodeBase64(binaryAsset[1]), {
      headers: {
        "content-type": binaryAsset[0],
        "cache-control": cacheControl(normalizedPath)
      }
    });
  }

  if (!normalizedPath.includes(".")) {
    return responseFor("/");
  }

  return new Response("Not found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    return responseFor(url.pathname);
  }
};
`;

await mkdir(dirname(serverFile), { recursive: true });
await mkdir(dirname(hostingTarget), { recursive: true });
await writeFile(serverFile, workerSource);
await copyFile(hostingSource, hostingTarget);

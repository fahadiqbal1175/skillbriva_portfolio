import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const serverFile = resolve(root, "dist/server/index.js");
const hostingSource = resolve(root, ".openai/hosting.json");
const hostingTarget = resolve(root, "dist/.openai/hosting.json");

const workerSource = `const INDEX_PATH = "/index.html";

function isAssetPath(pathname) {
  return pathname.startsWith("/assets/") || pathname.startsWith("/resources/");
}

async function serveAsset(request, env) {
  if (env?.ASSETS?.fetch) {
    return env.ASSETS.fetch(request);
  }
  return new Response("Static asset binding is unavailable.", { status: 500 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (isAssetPath(url.pathname)) {
      return serveAsset(request, env);
    }

    const response = await serveAsset(request, env);
    if (response.status !== 404) {
      return response;
    }

    const indexUrl = new URL(INDEX_PATH, request.url);
    return serveAsset(new Request(indexUrl, request), env);
  }
};
`;

await mkdir(dirname(serverFile), { recursive: true });
await mkdir(dirname(hostingTarget), { recursive: true });
await writeFile(serverFile, workerSource);
await copyFile(hostingSource, hostingTarget);

import https from "node:https";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const channels = [
  ["logistika", "https://t.me/DEXTRANSWORLDWIDE"],
  ["foto-video", "https://t.me/dextransworld"],
  ["textil", "https://t.me/DEXTRANS_TEXTIL_PRINT"],
  ["dex-car", "https://t.me/dex_cars"],
];

const dir = path.join(process.cwd(), "public", "channels");
fs.mkdirSync(dir, { recursive: true });

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function download(url, file) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const stream = fs.createWriteStream(file);
    mod
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          download(res.headers.location, file).then(resolve).catch(reject);
          return;
        }
        res.pipe(stream);
        stream.on("finish", () => resolve(file));
      })
      .on("error", reject);
  });
}

for (const [id, url] of channels) {
  const html = await fetchText(url);
  const match = html.match(/property="og:image" content="([^"]+)"/);
  if (!match) {
    console.log(id, "NO IMAGE");
    continue;
  }
  const file = path.join(dir, `${id}.jpg`);
  await download(match[1], file);
  console.log(id, file, fs.statSync(file).size);
}

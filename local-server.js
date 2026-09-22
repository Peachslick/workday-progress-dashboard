const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split("?")[0]);
  const requested = clean === "/" ? "/index.html" : clean;
  const filePath = path.resolve(root, "." + requested);
  if (!filePath.startsWith(root)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, {"Content-Type": "text/plain; charset=utf-8"}); res.end("Not found"); return;
    }
    res.writeHead(200, {"Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache"});
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, "127.1.0.1", () => {
  console.log(`Workday Journey V7.4.0: http://localhost:${port}`);
  console.log("Press Ctrl+C to stop.");
});

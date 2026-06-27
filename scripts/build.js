const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const files = ["index.html", "app.js", "styles.css"];
const directories = ["assets"];

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(rootDir, file), path.join(distDir, file));
}

for (const directory of directories) {
  copyDirectory(path.join(rootDir, directory), path.join(distDir, directory));
}

fs.writeFileSync(
  path.join(distDir, "_routes.json"),
  `${JSON.stringify({ version: 1, include: ["/api/*"], exclude: [] }, null, 2)}\n`
);

console.log(`Built static Cloudflare Pages assets in ${path.relative(rootDir, distDir)}`);

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }

  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

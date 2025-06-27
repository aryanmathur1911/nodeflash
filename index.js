#!/usr/bin/env node

const fs = require("fs");
const crypto = require("crypto");
const { spawn } = require("child_process");
const path = require("path");

let proc = null;
let lastHash = "";

const fileToWatch = process.argv[2];

if (!fileToWatch) {
  console.error("❌ Usage: nodeflash <filename.js>");
  process.exit(1);
}

const absPath = path.resolve(process.cwd(), fileToWatch); //converts relative path of file to watch to absolute path

const hashFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return crypto.createHash("sha256").update(content).digest("hex");
  } catch (err) {
    console.error(`❌ Error reading file: ${err.message}`);
    return "";
  }
};

function runFile(filePath) {
  if (proc) {
    proc.kill();
    console.log("🔁 Restarting...");
  }
  proc = spawn("node", [filePath], { stdio: "inherit" });
}

function checkAndRestart(filePath) {
  const currentHash = hashFile(filePath);
  if (currentHash && currentHash !== lastHash) {
    lastHash = currentHash;
    console.log(`📁 Change detected in ${filePath}`);
    runFile(filePath);
  }
}

console.log(`🚀 Watching file: ${fileToWatch}`);
lastHash = hashFile(absPath);
runFile(absPath);

// Polling every 1 second
setInterval(() => {
  checkAndRestart(absPath);
}, 1000);

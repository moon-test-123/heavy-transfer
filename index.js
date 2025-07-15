/* eslint-disable no-console */

const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// __dirname is available in CommonJS
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 * 1024 }, // 20GB
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file received" });
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
  });
});

app.get("/download/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${req.params.filename
      .split("-")
      .slice(1)
      .join("-")}"`
  );
  fs.createReadStream(filePath).pipe(res);
});

app.listen(PORT, () =>
  console.log(`✔ File-server available at http://localhost:${PORT}`)
);

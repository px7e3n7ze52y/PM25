var express = require("express");
var router = express.Router();
const fileModel = require("../model/fileModel.js");
const multer = require("multer");

let filename = "";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets/upload");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    filename = `${new Date().toJSON().slice(0, 10)}-${originalname}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

router.get("/uploadView", function (req, res, next) {
  res.render("fileIndex");
});

router.post(
  "/uploadCSVfile",
  upload.single("file"),
  async function (req, res, next) {
    const result = await new fileModel().No4(filename);
    res.json({ message: result });
  }
);

router.get("/downloadNo4A", async function (req, res, next) {
  const result = await new fileModel().No4A();
  res.download("public/assets/download/" + result);
});

router.get("/downloadNo4B", async function (req, res, next) {
  const result = await new fileModel().No4B();
  res.download("public/assets/download/" + result);
});

router.get("/downloadNo4C", async function (req, res, next) {
  const result = await new fileModel().No4C(req.query.country);
  res.download("public/assets/download/" + result);
});

router.get("/downloadNo4D", async function (req, res, next) {
  const result = await new fileModel().No4D(
    req.query.year,
    req.query.colorpm25
  );
  res.download("public/assets/download/" + result);
});

module.exports = router;

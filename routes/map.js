var express = require("express");
var router = express.Router();
const mapModel = require("../model/mapModel");

router.get("/mapIndex", function (req, res, next) {
  res.render("mapIndex");
});

router.get("/mapView", function (req, res, next) {
  res.render("mapView");
});

router.get("/mapNo5All", async function (req, res, next) {
  const result = await new mapModel().getAllPoint();
  res.json(result);
});

router.get("/mapNo5A", async function (req, res, next) {
  const result = await new mapModel().No5A(req.query.year);
  res.json(result);
});

router.get("/mapNo5B", async function (req, res, next) {
  const result = await new mapModel().No5B();
  res.json(result);
});

router.get("/mapNo5C", async function (req, res, next) {
  const result = await new mapModel().No5C();
  res.json(result);
});

router.get("/mapNo5D", async function (req, res, next) {
  const result = await new mapModel().No5D();
  res.json({ result: result.result, polygon: result.polygon });
});

router.get("/mapNo5E", async function (req, res, next) {
  const result = await new mapModel().No5E();
  res.json(result);
});

router.get("/mapNo5F", async function (req, res, next) {
  const result = await new mapModel().No5F(req.query.year);
  res.json(result);
});

module.exports = router;

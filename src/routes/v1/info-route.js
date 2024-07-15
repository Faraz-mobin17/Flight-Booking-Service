const express = require("express");

const { InfoController } = require("../../controllers");

const router = express.Router();

router.get("/", InfoController.info);

module.exports = router;

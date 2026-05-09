const router = require("express").Router();
const controller = require("../controllers/sse.controller");

// TODO: remove all SSE
router.get("/events/:roomCode", controller.subscribe);
router.post("/showGraphs", controller.showGraphs);

module.exports = router;

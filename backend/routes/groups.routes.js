const router = require("express").Router();
const controller = require("../controllers/groups.controller");
const { requireRole } = require("../middleware/auth.middleware");

router.post("/createGroup", requireRole(["ADMIN"]), controller.createGroup);
router.put("/:groupCode/showGraphs", requireRole(["ADMIN"]), controller.setShowGraphs);
router.get("/:groupCode/showGraphs", controller.getShowGraphs);
router.get("/:groupCode", controller.getGroup);
router.get("/", controller.listGroups);

module.exports = router;

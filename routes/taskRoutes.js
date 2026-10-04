const express = require("express");
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.route("/").post(createTask).get(getAllTasks);

router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);

module.exports = router;

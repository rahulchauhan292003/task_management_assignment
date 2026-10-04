const Task = require("../models/Task");
const { createTaskSchema } = require("../utils/taskValidation");

const createTask = async (req, res) => {
  try {
    const validatedData = await createTaskSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { title } = validatedData;

    const existingTask = await Task.findOne({
      title,
      user: req.user._id,
    });

    if (existingTask) {
      return res.status(409).json({
        success: false,
        message: "Task with this title already exists",
      });
    }

    const task = await Task.create({
      ...validatedData,
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.log("--->", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const { search, status, priority } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = {
      user: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTasks = await Task.countDocuments(filter);

    return res.status(200).json({
      success: true,
      totalTasks,
      currentPage: page,
      totalPages: Math.ceil(totalTasks / limit),
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const validatedData = await createTaskSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    // console.log("--->>",validatedData)
    // console.log("---id",req.user._id)

    if (validatedData.title) {
      const existingTask = await Task.findOne({
        title: validatedData.title,
        user: req.user._id,
        _id: { $ne: req.params.id },
      });

      if (existingTask) {
        return res.status(409).json({
          success: false,
          message: "Task with this title already exists",
        });
      }
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      validatedData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};

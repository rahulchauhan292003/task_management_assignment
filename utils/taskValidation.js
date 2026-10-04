const yup = require("yup");

const { TASK_STATUS, TASK_PRIORITY } = require("../constants/taskConstants");

const createTaskSchema = yup.object({
  title: yup.string().trim().required("Title is required"),
  description: yup.string().trim().optional(),

  status: yup.string().oneOf(Object.values(TASK_STATUS), "Invalid task status"),

  priority: yup
    .string()
    .oneOf(Object.values(TASK_PRIORITY), "Invalid task priority"),

  dueDate: yup.date().optional(),
});

module.exports = { createTaskSchema };

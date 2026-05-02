import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/user.models.js";
import Project from "../src/models/project.models.js";
import Task from "../src/models/task.models.js";

dotenv.config();

const TAG = process.env.BENCH_TAG || "teamops_bench_v1";
const USERS_COUNT = Number(process.env.BENCH_USERS || 1200);
const PROJECTS_COUNT = Number(process.env.BENCH_PROJECTS || 1000);
const TASKS_COUNT = Number(process.env.BENCH_TASKS || 10000);
const PASSWORD = process.env.BENCH_USER_PASSWORD || "Benchmark@123";
const BENCH_USER_EMAIL =
  process.env.BENCH_USER_EMAIL || `bench.user.${TAG}@teamops.dev`;
const BENCH_ADMIN_EMAIL =
  process.env.BENCH_ADMIN_EMAIL || `bench.admin.${TAG}@teamops.dev`;
const RESET = String(process.env.BENCH_RESET || "true").toLowerCase() === "true";

if (!process.env.MONGO_URL) {
  throw new Error("MONGO_URL is required");
}

const randFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wordsA = ["Atlas", "Nimbus", "Orion", "Lattice", "Vertex", "Harbor"];
const wordsB = ["Platform", "Pipeline", "Workflow", "Growth", "Insights", "Ops"];
const priorities = ["low", "medium", "high"];
const statuses = ["todo", "in_progress", "done"];

const buildUserDoc = (i, hashedPassword) => {
  const role = i % 20 === 0 ? "admin" : i % 5 === 0 ? "manager" : "user";
  return {
    name: `Engineer ${i} ${TAG}`,
    email: `seed.${TAG}.${i}@teamops.dev`,
    password: hashedPassword,
    role,
    isActive: true,
  };
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  if (RESET) {
    await Task.deleteMany({ title: new RegExp(`^\\[${TAG}\\]`) });
    await Project.deleteMany({ name: new RegExp(`^\\[${TAG}\\]`) });
    await User.deleteMany({ email: new RegExp(`\\.${TAG}@teamops\\.dev$`) });
  }

  const users = [];
  for (let i = 0; i < USERS_COUNT; i += 1) {
    users.push(buildUserDoc(i, hashedPassword));
  }

  users.push({
    name: `Benchmark Admin ${TAG}`,
    email: BENCH_ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });
  users.push({
    name: `Benchmark User ${TAG}`,
    email: BENCH_USER_EMAIL,
    password: hashedPassword,
    role: "user",
    isActive: true,
  });

  await User.bulkWrite(
    users.map((u) => ({
      updateOne: {
        filter: { email: u.email },
        update: { $set: u },
        upsert: true,
      },
    }))
  );

  const allUsers = await User.find({ email: new RegExp(`(${TAG}|\\.${TAG})`) })
    .select("_id role email")
    .lean();
  const admin = allUsers.find((u) => u.email === BENCH_ADMIN_EMAIL);
  const benchUser = allUsers.find((u) => u.email === BENCH_USER_EMAIL);
  const membersPool = allUsers.filter((u) => u.role !== "admin");

  if (!admin || !benchUser) {
    throw new Error("Failed to create benchmark users");
  }

  const projectDocs = [];
  for (let i = 0; i < PROJECTS_COUNT; i += 1) {
    const memberIds = [benchUser._id];
    for (let j = 0; j < 5; j += 1) {
      memberIds.push(randFrom(membersPool)._id);
    }
    projectDocs.push({
      name: `[${TAG}] ${randFrom(wordsA)} ${randFrom(wordsB)} ${String(i).padStart(4, "0")}`,
      description: `Program ${i} focused on delivery quality and cross-team execution.`,
      owner: admin._id,
      members: [...new Set(memberIds.map(String))].map(
        (id) => new mongoose.Types.ObjectId(id)
      ),
    });
  }

  await Project.insertMany(projectDocs, { ordered: false });
  const projects = await Project.find({ name: new RegExp(`^\\[${TAG}\\]`) })
    .select("_id members")
    .lean();

  const taskDocs = [];
  for (let i = 0; i < TASKS_COUNT; i += 1) {
    const project = projects[i % projects.length];
    const assignedTo = project.members[i % project.members.length];
    const dueDate = new Date(Date.now() + (i % 90) * 24 * 60 * 60 * 1000);
    taskDocs.push({
      title: `[${TAG}] ${randFrom(wordsA)} ${randFrom(wordsB)} Task ${i}`,
      description: `Deliverable ${i} for remote team coordination and sprint tracking.`,
      status: statuses[i % statuses.length],
      priority: priorities[i % priorities.length],
      project: project._id,
      assignedTo,
      createdBy: admin._id,
      dueDate,
      createdAt: new Date(Date.now() - (i % 120) * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  await Task.insertMany(taskDocs, { ordered: false });

  const topProject = await Task.aggregate([
    { $match: { title: new RegExp(`^\\[${TAG}\\]`) } },
    { $group: { _id: "$project", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  console.log(
    JSON.stringify(
      {
        tag: TAG,
        usersSeeded: users.length,
        projectsSeeded: PROJECTS_COUNT,
        tasksSeeded: TASKS_COUNT,
        benchUserEmail: BENCH_USER_EMAIL,
        benchAdminEmail: BENCH_ADMIN_EMAIL,
        benchPasswordHint: "Read BENCH_USER_PASSWORD from .env",
        heavyProjectId: topProject?.[0]?._id || null,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

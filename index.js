const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

let users = [];
let exercises = [];

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Create new user
app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const newUser = { username, _id: generateId() };
  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// Add exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.find((u) => u._id === _id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const newExercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date(),
    _id: generateId(),
  };

  exercises.push(newExercise);
  res.json({ ...user, ...newExercise });
});

// Get user's log
app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const user = users.find((u) => u._id === _id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const userExercises = exercises.filter(
    (exercise) => exercise.username === user.username
  );
  res.json({
    ...user,
    count: userExercises.length,
    log: userExercises.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    })),
  });
});

// Helper function to generate unique ID
function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

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

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const newUser = { username, _id: generateId() };
  users.push(newUser);
  res.json(newUser);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.find((u) => u._id === _id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const newExercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date(),
    _id: generateId(),
  };

  user.log = user.log || [];
  user.log.push(newExercise);

  res.json(user);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const user = users.find((u) => u._id === _id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  let log = user.log || [];

  const { from, to, limit } = req.query;

  if (from && to) {
    log = log.filter((exercise) => {
      const exerciseDate = new Date(exercise.date);
      return exerciseDate >= new Date(from) && exerciseDate <= new Date(to);
    });
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    ...user,
    log,
  });
});

function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
  
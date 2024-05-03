const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

let users = [];

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Create new user
app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const newUser = { username, _id: generateId(), log: [] };
  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", function (req, res) {
  var userId = req.params._id;
  var description = req.body.description;
  var duration = req.body.duration;
  var date = req.body.date;

  console.log("### add a new exercise ###".toLocaleUpperCase());

  // Check for date
  if (!date) {
    date = new Date().toISOString().substring(0, 10);
  }

  console.log(
    "looking for user with id [".toLocaleUpperCase() + userId + "] ..."
  );

  // Find the user
  const user = users.find((user) => user._id === userId);

  if (!user) {
    console.log("There are no users with that ID in the database!");
    res.json({ message: "There are no users with that ID in the database!" });
    return;
  }

  // Create new exercise
  const newExercise = {
    userId: user._id,
    username: user.username,
    description: description,
    duration: parseInt(duration),
    date: date,
  };

  user.log.push(newExercise);

  console.log("Exercise created successfully!");

  // Return the user object with the added exercise fields
  res.json(user);
});


// Get user's log
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

  // Mengembalikan objek pengguna dengan log array yang sesuai
  res.json({
    username: user.username,
    _id: user._id,
    count: log.length,
    log: log.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString(),
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
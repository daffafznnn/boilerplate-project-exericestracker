const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let users = [];

// Generate unique ID
function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// Routes
app.get("/", (_req, res) => {
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
app.get("/api/users", (_req, res) => {
  res.json(users);
});

// Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.find(u => u._id === _id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const newExercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date()
  };

  user.log.push(newExercise);

  res.json(user); // Return the user object with added exercise fields
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

  res.json({
    ...user,
    count: log.length,
    log: log.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString(),
    })),
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
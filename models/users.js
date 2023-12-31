const mongoose = require("mongoose");
const timeElapsed = Date.now();
const today = new Date(timeElapsed);

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => {
  console.log(error);
});

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    created: {
      type: String,
      required: true,
      default: today.toLocaleDateString(),
    },
  },
  {
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

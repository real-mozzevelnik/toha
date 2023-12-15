const User = require("../models/users");
const Task = require("../models/tasks");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const { validationRegister } = require("../middleware/validation");
const auth = require("../middleware/auth");

exports.register = [
  async (req, res) => {
    try {
      const email = req.body.email;
      const username = req.body.username;
      const password = req.body.password;
      
      const { error } = await validationRegister(req.body);

      const userExist = await User.find({ username: username });
      const emailExist = await User.find({ email: email });
      if (error) {
        req.flash("error", error.details[0].message);
        res.redirect("/register");
      } else if (emailExist.length > 0) {
        req.flash("error", "Пользователь с такой почтой уже существует");
        res.redirect("/register");
      } else if (userExist.length > 0) {
        req.flash("error", "Пользователь с таким именем уже существует");
        res.redirect("/register");
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        const inputUser = new User({
          id: uuidv4(),
          email: email,
          username: username,
          password: hashedPassword,
        });
        const taskUser = new Task({
          username: username,
        });
        taskUser.save();
        inputUser.save((err, user) => {
          if (err) {
            return res.redirect("/register");
          }
          console.log(user);
          return res.redirect("/login");
        });
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/register");
    }
  },
];
exports.login = [
  async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!(username && password)) {
        req.flash("error", "Пожалуйста, укажите имя пользователя и пароль");
      }
      
      const user = await User.findOne({ username });
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = await jwt.sign(
          { username: username },
          process.env.SECRET_TOKEN,
          { algorithm: "HS256", expiresIn: "2h" }
        );
        console.log("LOGGED IN");
        res.cookie("access_token", token, {
          secure: true,
        });
        
        return res.redirect("/index");
    
      } else {
        req.flash("error", "Пароль или имя пользователя неверны");
        res.redirect("/login");
      }
    } catch (err) {
      console.log(err);
    }
  },
];

exports.showLogin = [
  (req, res) => {
    const token = req.cookies.access_token;
    if (!token) {
      res.render("login", {
        error: req.flash("error"),
        success: req.flash("success"),
      });
    } else {
      return res.redirect("/index");
    }
  },
];

exports.showRegister = [
  (req, res) => {
    const token = req.cookies.access_token;
    if (!token) {
      res.render("register", {
        error: req.flash("error"),
      });
    } else {
      return res.redirect("/index");
    }
  },
];
exports.logout = [
  auth,
  (req, res) => {
    const token = req.cookies.access_token;
    if (!token) {
      return res.redirect("/login");
    }
    res.clearCookie("access_token");
    return res.redirect("/login");
  },
];

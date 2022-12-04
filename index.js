const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

const mockDB = [
  {
    email: "user@gmail.com",
    firstName: "User Test",
  },
];

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send(`<h1>Hello world</h1>`);
});

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!(firstName && lastName && email && password)) {
      return res.status(400).send("All fields are required!");
    }
    const user = mockDB.find((u) => u.email === email);
    if (user) {
      res.status(401).send("User exist!");
    }
    const encPassword = await bcrypt.hash(password, 10);
    console.log({ encPassword });
    const userObj = {
      password: encPassword,
      firstName,
      email,
      lastName,
    };
    console.log({ userObj });
    mockDB.push({ ...userObj });
    const token = jwt.sign({ email: userObj.email }, "some_secret_value", {
      expiresIn: "2h",
    });
    userObj.token = token;
    userObj.password = undefined;
    res.status(201).json(userObj);
  } catch (err) {
    console.error(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send("Fields are missing!");
    }

    const user = mockDB.find((u) => u.email === email);
    console.log({ user });
    const isPassSame = await bcrypt.compare(password, user.password);
    if (user && isPassSame) {
      const token = jwt.sign(
        {
          email,
        },
        "some_secret_value",
        {
          expiresIn: "2h",
        }
      );
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.status(200).cookie("token", token, options).json({
        success: true,
        user,
      });
    }
  } catch (err) {
    console.error(err);
  }
});

app.get("/dashboard", auth, (req, res) => {
  console.log(req.user)
  res.send("Welcome to dashboard!");
});

app.listen(3000);
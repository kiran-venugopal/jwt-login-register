const jwt = require("jsonwebtoken");

const myTokenSecret = "some_secret_value";

const auth = (req, res, next) => {
  console.log(req.cookies);
  const { token } = req.cookies;
  if (!token) {
    res.status(403).send("please login first!");
  }
  try {
    const decoded = jwt.verify(token, myTokenSecret);
    console.log({ decoded });
    req.user = decoded;
  } catch (err) {
    console.error(err);
    res.status(401).send("invalid token!");
  }

  return next();
};

module.exports = auth;

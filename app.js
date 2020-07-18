const express = require("express");
// const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require('passport');

//EXPRESS
const app = express();
//EJS LAYOUTS

app.set("view engine", "ejs");
// app.use(expressLayouts);

//PASSPORT STRATEGY
require('./config/passport')(passport);

//MONGOOSE
mongoose
  .connect("mongodb://localhost:27017/userDataDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongodb connected.");
  })
  .catch((err) => {
    console.log(err);
  });

//BODY-PARSER
app.use(bodyParser.urlencoded({ extended: true }));

// EXPRESS-SESSION
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//FLASH
app.use(flash());

//global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//HOME (WELCOME) ROUTE
app.use("/", require("./routes/index"));
app.use("/login", require("./routes/index"));
app.use("/register", require("./routes/index"));

//FOR CUSTOM CSS
app.use(express.static("public"));

//DEFAULT SERVER
app.listen(3000, () => {
  console.log("Server running on port 3000");
});


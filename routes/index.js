const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

//BRING PASSPORT AUTH
const { ensureAuthenticated } = require("../config/auth");

//bring mongoose model FOR LOGIN/REG PROCESS
const User = require("../model/User");
//bring mongoose model FOR LOG PROCESS
const UserData = require("../model/Data");

var date = new Date();
var todaysDate =
  date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
//  var options = { weekday: 'long'};
//  var justDay = todaysDate.toLocaleDateString('en-US', options);

var dateCheck = todaysDate;
var userPdy;
var stuffz;

//WELCOME ROUTE
router.get("/", (req, res) => {
  res.render("welcome");
});

//LOGIN ROUTE *****
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});
//LOGIN ROUTE ENDS*****

//REGISTER ROUTE *****
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  const { name, name2, email, number, password, password2 } = req.body;
  var regErrors = [];

  //CHECK CONDITIONS
  if (!name || !name2 || !email || !number || !password || !password2) {
    regErrors.push({ msg: "Enter all the fields." });
  }
  if (number.length != 4) {
    regErrors.push({ msg: "Employee number should be 4 digits long." });
  }
  if (password.length < 6) {
    regErrors.push({ msg: "Password should be atleast 6 character long." });
  }
  if (password != password2) {
    regErrors.push({ msg: "Passwords do not match" });
  }
  if (regErrors.length > 0) {
    res.render("register", {
      regErrors,
      name,
      name2,
      email,
      number,
      password,
      password2,
    });
  } else {
    //CHECK IF ALREADY EXISTS
    User.findOne({ email: email }).then((user) => {
      //IF USER ALREADY EXIST
      if (user) {
        regErrors.push({ msg: "This email is already registered." });
        res.render("register", {
          regErrors,
          name,
          name2,
          email,
          number,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          name2,
          email,
          number,
          password,
        });

        //ENCRYPT PASSWORD
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            // Store hash as your password.
            newUser.password = hash;
            //SAVE
            newUser
              .save()
              .then((user) => {
                console.log("User register data saved to db.");
                req.flash(
                  "success_msg",
                  "You are now registered, login to proceed."
                );
                res.redirect("/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});
//REGISTER ROUTE ENDS *****

//DASHBOARD ROUTE *****
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  var lgUser = req.user.name; //logged in users name
  console.log("DATE CHECK DEFAULT "+ dateCheck);
  console.log("DATE CHECK ON ASSIGNED "+ todaysDate);
  //DATECHECK IS DEFAULT TODAYS DATE
  if (todaysDate == dateCheck) {
    console.log("Date matches for today.");
  } else {
    console.log("Date does not match with today.");
  }
  UserData.find({ $and: [{ loggedUser: lgUser }, { date: todaysDate }] }).then(
    (stuffx) => {
      //FINDS ALL DATA BY PRANAY
      if (stuffx.length == 0) {
        //IF USER HAS NO DATA IN SERVER
        console.log("New login -> empty userdata");
        if (todaysDate == dateCheck) {
          res.render("dash_empty", {
            userName: lgUser,
            todaysDate: todaysDate,
          });
        } else {
          res.render("dash_nodata", {
            userName: lgUser,
            todaysDate: todaysDate,
          });
        }
      } else {
        if (todaysDate == dateCheck) {
          //IF USER HAS DATA IN SERVER
          console.log("Old login -> userdata present");
          res.render("dashboard", {
            stuffx: stuffx,
            userName: lgUser,
            todaysDate: todaysDate,
          });
        } else {
          console.log("Old login -> userdata present");
          res.render("dashboard_history", {
            stuffx: stuffx,
            userName: lgUser,
            todaysDate: todaysDate,
          });
        }
      }
    }
  );
});

router.post("/dashboard", (req, res) => {
  const { job_number, job_description, job_hours } = req.body;
  var date = todaysDate;
  var loggedUser = req.user.name; //logged in users name
  const newUserData = new UserData({
    loggedUser,
    job_number,
    job_description,
    job_hours,
    date,
  });
  newUserData.save();
  res.redirect("/dashboard");
});
//DASHBOARD ROUTE ENDS *****

// DELETE ROUTE *****
router.post("/delete", (req, res) => {
  // console.log(req.body);
  const { delete_id } = req.body;
  console.log(delete_id);

  UserData.deleteOne({ _id: delete_id }, (err) => {
    if (err) {
      console.log("Error while deleting.");
    } else {
      console.log("Deleted successfully.");
      res.redirect("/dashboard");
    }
  });
});
// DELETE ROUTE ENDS *****

// PICKED DATE ROUTE *****
router.post("/pickedDate", (req, res) => {
  const { picked_date } = req.body; //2020-06-20
  var userPd = formatDate(picked_date);
  todaysDate = userPd;
  console.log("PICKED DATE IS "+ todaysDate );
  res.redirect("/dashboard");
});
// PICKED DATE ROUTE ENDS *****

// LOGOUT *****
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/login");
});
// LOGOUT ENDS *****

//ADMIN ROUTE *****
router.get("/admin", ensureAuthenticated, (req, res) => {
  var lgUser = req.user.name; //logged in users name
  if (stuffz == null) {
    res.render("admin_empty", {
      userName: lgUser,
    });
  } else {
    res.render("admin", {
      userName: lgUser,
      stuffz: stuffz,
    });
  }
});

router.post("/admin", (req, res) => {
  var lgUser = req.user.name; //logged in users name
  const { searchJobNo } = req.body;
  UserData.find({ job_number: searchJobNo }).then((stuffy) => {
    if (stuffy.length == 0) {
      console.log("User search >>> empty.");
      res.render("admin_nodata", {
        userName: lgUser,
      });
    } else {
      console.log("User search >>> not empty.");
      stuffz = stuffy;
      res.redirect("/admin");
    }
  });
});
//ADMIN ROUTE ENDS *****

function formatDate(pd) {
  //2020-06-20
  var pdYear = pd.substring(0, 4);
  var pdMonth1 = pd.substring(5, 7);
  var pdMonth;
  if (pdMonth1 < 10) {
    console.log("Less than 10");
    pdMonth = pdMonth1.substring(1, 2);
  } else {
    pdMonth = pdMonth1;
  }
  
  var pdDay1 = pd.substring(8, 10);
  var pdDay;
  if (pdDay1 < 10) {
    var pdDay = pd.substring(9, 10);
  } else{
    var pdDay = pdDay1;
  }

  var formattedDate = pdDay + "/" + pdMonth + "/" + pdYear;
  return formattedDate;
  
}

module.exports = router;

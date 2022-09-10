const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
// Create Schema for Users
const Users = require("../models/Users");
//import bcrypt
const bcrypt = require("bcrypt");

//make a function to generate token
function generateToken(user) {
  return jwt.sign(user, "secret", {
    expiresIn: "1h",
  });
}
//make a route to login
router.get("/all", (req, res) => {
  //exclude the password from the response
  Users.find({}, { password: 0 }, (err, users) => {
    if (err) {
      res.send(err);
    } else {
      res.json(users);
    }
  });
});

//create or update user
router.post("/usercrud", (req, res) => {
  //check if the user exists
  //encrypt the password

  bcrypt.hash(req.body.password, 10, (err, hash) => {
    req.body.password = hash;
    if (err) {
      return res.status(500).json({
        error: err,
      });
    } else {
      //check if the user exists
      Users.findOne({ Username: req.body.Username }, (err, user) => {
        if (err) {
          res.send(err);
        } else {
          if (user) {
            //if the user exists, update the user
            Users.findOneAndUpdate(
              { Username: req.body.Username },
              { $set: req.body },
              { new: true },
              (err, user) => {
                if (err) {
                  res.send(err);
                } else {
                  res.json(user);
                }
              }
            );
          } else {
            //if the user does not exist, create a new user
            const newUser = new Users(req.body);
            newUser.save((err, user) => {
              if (err) {
                res.send(err);
              } else {
                res.json(user);
              }
            });
          }
        }
      });
    }
  });
});

router.post("/", (req, res) => {
  //find user
  Users.findOne({
    Username: req.body.Username,
  }).then((user) => {
    if (!user) {
      return res.status(400).json({
        msg: "User does not exist",
      });
    }
    //check password
    bcrypt.compare(req.body.password, user.password).then((isMatch) => {
      if (!isMatch) {
        return res.status(400).json({
          msg: "Invalid credentials",
        });
      }
      //generate token
      const payload = {
        id: user.id,
        name: user.name,
        Username: user.Username,
        role: user.role,
      };
      //sign token
      jwt.sign(
        payload,
        "secret",
        {
          expiresIn: 3600,
        },
        (err, token) => {
          //excldue the password from the user object
          user.password = undefined;
          if (err) throw err;
          res.json({
            token: token,
            user: user,
          });
        }
      );
    });
  });
});
//make a route to register
router.post("/register", (req, res) => {
  //check if user exists
  Users.findOne({
    Username: req.body.Username,
  }).then((user) => {
    if (user) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }
    //create new user
    console.log(req.body);
    const newUser = new Users({
      name: req.body.name,
      Username: req.body.Username,
      password: req.body.password,
      role: req.body.role,
    });
    console.log(newUser);
    //if password is null
    if (newUser.password == null) {
      return res.status(400).json({
        msg: "Password is required",
      });
    }

    //hash password
    bcrypt.genSalt(10, function (err, salt) {
      if (err) throw err;
      console.log(salt);
      bcrypt.hash(newUser.password, salt, function (err, hash) {
        if (err) throw err;
        newUser.password = hash;
        //save user
        newUser.save().then((user) => {
          res.json(user);
        });
      });
    });
  });
});
//make a route to get user
router.get("/me", (req, res) => {
  res.json(req.user);
});
//make a route to logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    msg: "Logged out",
  });
});

module.exports = router;

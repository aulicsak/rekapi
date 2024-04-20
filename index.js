const express = require("express");
const app = express();
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const PORT = process.env.PORT || 3500;
const Booking = require("./models/Booking");

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "gs÷no=e+l5guĐb{nso&439%875gg#hsßpiu/edhf)gbv*l-k$js";

connectDB();

app.use(logger);

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));


app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });

  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        { username: userDoc.username, id: userDoc._id },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          //res.setHeader('Access-Control-Allow-Headers', 'Content-Type, token');
          res.cookie("token", token).status(200).json(userDoc);
        }
      );
    } else {
      //res.header("Access-Control-Allow-Origin", "*");
      //res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(422).json("Wrong Password");
    }
  } else {
    //res.header("Access-Control-Allow-Origin", "*");
    //res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(404).json("User not Found");
  }
});

app.post("/admin_register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, bcryptSalt),
    });

    res.status(200).json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.patch("/admin_pwchng", async (req, res) => {
  const { username, oldpassword, newpassword, newpasswordagain } = req.body;
  const userDoc = await User.findOne({ username });
  const passesMatch = newpassword === newpasswordagain;
  const passOk = bcrypt.compareSync(oldpassword, userDoc.password);
  const { token } = req.cookies;

  if (userDoc) {
    if (passesMatch) {
      if (passOk) {
        jwt.verify(token, jwtSecret, {}, async (err) => {
          if (err) throw err;
          if (oldpassword == newpassword) {
            res.status(422).json("New password cannot be the same as old");
          } else {
            try {
              const newUserDoc = await User.updateOne(
                { username },
                { password: bcrypt.hashSync(newpassword, bcryptSalt) }
              );
              res.status(200).json(newUserDoc);
            } catch (e) {
              res.status(422).json(e);
            }
          }
        });
      } else {
        res.status(422).json("Wrong Password");
      }
    } else {
      res.status(422).json("Passwords don't match");
    }
  } else {
    res.status(404).json("Not Found");
  }
});

app.delete("/logout", async (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err) => {
    if (err) throw err;
    res.clearCookie("token");
    res.redirect("/login");
  });
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { username, _id } = await User.findById(userData.id);
      res.json({ username, _id });
    });
  } else {
    res.json(null);
  }
});

app.post("/booking", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    over18,
    tattoo_amount,
    tattoo_idea,
    tattoo_min,
    tattoo_max,
    body_part,
    tattoo_color,
    first_date,
    second_date,
    third_date,
    photos,
    terms,
  } = req.body;
  try {
    const bookingDoc = await Booking.create({
      first_name,
      last_name,
      email,
      over18,
      tattoo_amount,
      tattoo_idea,
      tattoo_min,
      tattoo_max,
      body_part,
      tattoo_color,
      first_date,
      second_date,
      third_date,
      photos,
      terms,
    });

    res.status(200).json(bookingDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.get("/bookings", (req,res)=> {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const bookings = await Booking.find().lean();
      if(!bookings?.length){
        return res.status(400).json("No bookings found")
      }
      res.json(bookings)
    });
  } else {
    res.json(null);
  }
})

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});

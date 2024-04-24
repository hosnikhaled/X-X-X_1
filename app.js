const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const guestRouters = require("./routes/GuestRoutes");
const adminRouters = require("./routes/AdminRoutes");
const path = require("path");
const config = require("config");
const ejs = require("ejs");
const User = require("./models/User");
const loginRouters = require("./routes/LoginRoutes");
const registerRouters = require("./routes/RegisterRoutes");
const passwordRouters = require("./routes/PasswordRoutes");
const stadiumRouters = require("./routes/StadiumRoutes");
const bcrypt = require("bcrypt");
const auth = require("./middlewares/AuthorizationMW");

const app = express();
const PORT = process.env.PORT | 3000;

mongoose
  .connect("mongodb://localhost:27017/users")
  .then(async () => {
    console.log("Database Connected");
    let existingRecords = await User.findOne({ username: "admin" });
    if (!existingRecords) {
      try {
        // Insert default records
        const salt = 10;
        let adminPassword = await bcrypt.hash(
          config.get("adminPassword"),
          salt
        );
        await User.insertMany([
          {
            username: "admin",
            gmail: "admin",
            password: adminPassword,
            isAdmin: true,
            isHost: false,
            isBlocked: false,
            verified: true,
            id: 1,
          },
        ]);
        console.log("Default records inserted successfully.");
      } catch (error) {
        console.error("Error inserting default records:", error);
      }
    }
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.static(path.join(__dirname, "views", "css")));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "img-src 'self' data: https://imgs.search.brave.com"
  );
  next();
});

app.use("/api", registerRouters);
app.use("/api", loginRouters);
app.use("/api", passwordRouters);
app.use("/api/guest", guestRouters);
app.use("/api/admin", auth, adminRouters);
app.use("/api/stadium", stadiumRouters);

app.listen(PORT, (err) => {
  if (!err) {
    console.log(`Server is Started at port: ${PORT}`);
  }
});

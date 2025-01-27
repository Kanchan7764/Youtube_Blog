require('dotenv').config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");

const userRouter = require("./Routes/user");
const blogRoute = require("./Routes/blog");

const { checkForAuthenticationCookie } = require("./middleware/authentication");
//const middleWare =require("./middleware/authentication");

const app = express();

const PORT = process.env.PORT || 8000;


mongoose
  .connect(process.env.DATABASE_URL||"mongodb://127.0.0.1:27017/Blog",{ serverSelectionTimeoutMS:5000})
     
  
  .then((e) => console.log("MongoDB Connected!"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("Home", {
    user: req.user,
    blogs: allBlogs,
  });
  //console.log(req.user);
  //console.log(req.user);
});

app.use("/user", userRouter);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
  console.log(`Server started at PORT:  ${PORT}`);
});

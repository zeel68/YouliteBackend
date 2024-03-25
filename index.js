import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";

dotenv.config({
  path: "./.env",
});

 

const app = express();
app.use(cors())

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

 


// //routes import
import userRouter from './route/user.route.js'


//routes declaration
app.use('/api/v1/users', userRouter)




app.get('/',(req,res) =>{
    res.send("hello world")
})



connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed!!! ", err);
  });
export default app
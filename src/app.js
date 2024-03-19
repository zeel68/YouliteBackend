import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
app.use(cors())

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())




// //routes import
// import userRouter from './route/user.route.js'


// //routes declaration
// app.use('/api/v1/users', userRouter)



export { app }
app.get('/',(req,res) =>{
    res.send("hello world")
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
})


export default { app }
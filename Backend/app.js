import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import { connectDB } from "./database/db.js"
import {errorMiddleware} from "./middleware/errorMiddleware.js"
import userRoutes from "./routes/userRoutes.js"
import {removeUnverifiedAccount} from "./automation/removeUnverifiedAccount.js"
const app=express();
dotenv.config({path:"./config/config.env"});

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/v1/user",userRoutes)

removeUnverifiedAccount()
connectDB();
app.use(errorMiddleware)

export default app;
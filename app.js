import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"
import { connectDB } from "./database/db.js";
import {errorMiddleware} from "./middlewares/errorMiddlewares.js"
import authrouter from "./routes/authRouter.js"
import userRouter from "./routes/userRouter.js"
import expressfileupload from "express-fileupload"
import { notifyUsers } from "./services/notifyUsers.js";

export const app = express();

config({path:"./config/config.env"})


app.use(cors({
    origin:"https://library.butiborichatadka.in",
    methods:["GET" ,"POST" , "PUT" , "DELETE"],
    credentials: true,
}))

app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use(expressfileupload({
    useTempFiles:true,
    tempFileDir:"/temp/"
}))

app.use("/api/v1/auth",authrouter )
app.use("/api/v1/user" , userRouter)
app.use("/api/v1/payment", require("./routes/paymentRouter.js"));
app.use("/api/v1/webhook", require("./routes/webhookRouter.js"));

notifyUsers();
connectDB();


app.use(errorMiddleware);

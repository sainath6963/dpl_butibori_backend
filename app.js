import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from "express-fileupload";
import errorMiddleware from './middlewares/errorMiddlewares.js';
import videoRoutes from "./routes/videoRoutes.js";
import path from "path";
// Import all routes
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import playerRouter from './routes/playerRouter.js';
import paymentRouter from './routes/paymentRouter.js';
import webhookRouter from './routes/webhookRouter.js';

const app = express();

// Regular express JSON parser for normal routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(fileUpload());

// ✅ Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
// }));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Use routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/players', playerRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/webhook', webhookRouter);
app.use("/api/videos", videoRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        time: new Date().toISOString()
    });
});

// Middleware for errors
app.use(errorMiddleware);

export default app;
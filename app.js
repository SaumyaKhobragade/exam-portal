import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import adminRoutes from './src/routes/adminRoutes.js';
import aiGraderRoutes from './src/routes/aiGrader.routes.js';
import { errorHandler } from './src/middlewares/errorHandler.middleware.js';


const app = express();
app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Use admin routes
app.use('/', adminRoutes);
app.use(aiGraderRoutes);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;

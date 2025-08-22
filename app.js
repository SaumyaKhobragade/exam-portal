import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import c from 'config';
import adminRoutes from './src/routes/adminRoutes.js';


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

export default app;

import dotenv from 'dotenv';
import connectDB from './src/db/index.js';
import app from './app.js';
import userRouter from "./src/routes/user.routes.js";
app.set('view engine', 'ejs');

dotenv.config({
    path: '.env'
});




// Register routes
app.use('/api/v1/users', userRouter);

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT} \nhttp://localhost:${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection error:", error);
    });
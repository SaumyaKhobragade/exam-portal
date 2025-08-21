import dotenv from 'dotenv';
import connectDB from './src/db/index.js';
import app from './app.js';
import userRouter from "./src/routes/user.routes.js";


app.set('view engine', 'ejs');
app.set('views', './src/views');

dotenv.config({
    path: '.env'
});

app.get('/', (req,res)=>{
    res.render('landingpage');
})
app.get('/about', (req,res)=>{
    res.render('about');
})
app.get('/contact', (req,res)=>{
    res.render('contact');
})
app.get('/ide', (req,res)=>{
    res.render('ide');
})
app.get('/login', (req,res)=>{
    res.render('loginregister');
})
app.get('/admin', (req,res)=>{
    res.render('userDashboard');
})


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
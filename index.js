
import dotenv from 'dotenv';
import connectDB from './src/db/index.js';
import app from './app.js';
import userRouter from "./src/routes/user.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import ownerRouter from "./src/routes/owner.routes.js";
import runCode from './src/utils/judge0.js';


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

app.get('/owner-dashboard', (req,res)=>{
    res.render('ownerDashboard');
});

app.get('/admin-dashboard', (req,res)=>{
    res.render('adminDashboard');
});

app.get('/user-dashboard', (req,res)=>{
    res.render('userDashboard');
});

app.get('/dashboard', (req,res)=>{
    res.render('userDashboard');
});

// Judge0 code execution route
app.post('/api/v1/execute', async (req, res) => {
    try {
        const { source_code, language_id, stdin } = req.body;
        
        if (!source_code) {
            return res.status(400).json({
                success: false,
                error: 'Source code is required'
            });
        }
        
        const result = await runCode(source_code, language_id, stdin);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Judge0 API error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});


// Register routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/owner', ownerRouter);

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT} \nhttp://localhost:${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection error:", error);
    });
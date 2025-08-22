
import dotenv from 'dotenv';
import connectDB from './src/db/index.js';
import app from './app.js';
import userRouter from "./src/routes/user.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import ownerRouter from "./src/routes/owner.routes.js";
import adminRouter from "./src/routes/admin.routes.js";
import examRequestRouter from "./src/routes/examRequest.routes.js";
import runCode from './src/utils/judge0.js';
import { verifyOwner, verifyAdminOrOwner, verifyJWT } from './src/middlewares/auth.middleware.js';


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

// Request exam hosting page
app.get('/request-hosting', (req,res)=>{
    res.render('requestExam');
});

// Alternative route for backward compatibility
app.get('/request-exam', (req,res)=>{
    res.render('requestExam');
});

// Logout route to clear cookies
app.get('/logout', (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.redirect('/login');
});

// Clear all cookies route for testing
app.get('/clear-cookies', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.send(`
        <h2>Cookies Cleared!</h2>
        <p>Authentication cookies have been cleared. Now test the protected routes:</p>
        <ul>
            <li><a href="/owner-dashboard">Owner Dashboard</a> (should redirect to login)</li>
            <li><a href="/admin-dashboard">Admin Dashboard</a> (should redirect to login)</li>
            <li><a href="/user-dashboard">User Dashboard</a> (should redirect to login)</li>
            <li><a href="/login">Login Page</a></li>
        </ul>
    `);
});

// Protected dashboard routes - require authentication
app.get('/owner-dashboard', verifyOwner, (req,res)=>{
    res.render('ownerDashboard');
});

app.get('/admin-dashboard', verifyAdminOrOwner, (req,res)=>{
    res.render('adminDashboard');
});

app.get('/user-dashboard', verifyJWT, (req,res)=>{
    res.render('userDashboard');
});

app.get('/dashboard', verifyJWT, (req,res)=>{
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
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/exam-requests', examRequestRouter);

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT} \nhttp://localhost:${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection error:", error);
    });
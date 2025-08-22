import mongoose from 'mongoose';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

async function verifyOwnerLogin() {
    try {
        // Connect to MongoDB
        const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
        
        // Import models
        const Owner = (await import('./src/models/owner.model.js')).default;
        const Admin = (await import('./src/models/admin.model.js')).default;
        const User = (await import('./src/models/user.model.js')).default;
        
        const email = 'owner@codesecure.com';
        const password = 'Owner@123456';
        
        console.log('=== TESTING LOGIN CREDENTIALS ===');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('');
        
        // Check in Owner collection
        console.log('--- Checking Owner Collection ---');
        const owner = await Owner.findOne({ email: email });
        if (owner) {
            console.log('✅ Owner found in database');
            console.log('ID:', owner._id.toString());
            console.log('Username:', owner.username);
            console.log('Email:', owner.email);
            console.log('Domain:', owner.domain);
            
            // Test password
            const isPasswordValid = await bcrypt.compare(password, owner.password);
            console.log('Password valid:', isPasswordValid);
            
            if (!isPasswordValid) {
                console.log('🔧 Password doesn\'t match, updating...');
                const hashedPassword = await bcrypt.hash(password, 10);
                owner.password = hashedPassword;
                await owner.save();
                console.log('✅ Password updated successfully');
            }
        } else {
            console.log('❌ Owner not found in Owner collection');
        }
        
        console.log('');
        
        // Check in Admin collection (sometimes owners might be stored as admins)
        console.log('--- Checking Admin Collection ---');
        const admin = await Admin.findOne({ email: email });
        if (admin) {
            console.log('✅ Found in Admin collection');
            console.log('ID:', admin._id.toString());
            console.log('Username:', admin.username);
            console.log('Email:', admin.email);
            console.log('Domain:', admin.domain);
            
            const isPasswordValid = await bcrypt.compare(password, admin.password);
            console.log('Password valid:', isPasswordValid);
        } else {
            console.log('❌ Not found in Admin collection');
        }
        
        console.log('');
        
        // Check in User collection
        console.log('--- Checking User Collection ---');
        const user = await User.findOne({ email: email });
        if (user) {
            console.log('✅ Found in User collection');
            console.log('ID:', user._id.toString());
            console.log('Username:', user.username);
            console.log('Email:', user.email);
            console.log('Domain:', user.domain);
            
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('Password valid:', isPasswordValid);
        } else {
            console.log('❌ Not found in User collection');
        }
        
        // Close connection
        await mongoose.connection.close();
        console.log('');
        console.log('Database connection closed');
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyOwnerLogin();

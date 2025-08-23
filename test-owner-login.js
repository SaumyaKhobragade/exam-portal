import mongoose from 'mongoose';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testOwnerLogin() {
    try {
        // Connect to MongoDB
        const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
        
        // Import models
        const Owner = (await import('./src/models/owner.model.js')).default;
        
        const email = 'owner@codesecure.com';
        const password = 'Owner@123456';
        
        console.log('=== TESTING EXACT LOGIN FLOW ===');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('');
        
        // Step 1: Find owner by email
        console.log('Step 1: Looking for owner with email...');
        const user = await Owner.findOne({ email });
        
        if (!user) {
            console.log('❌ User does not exist');
            await mongoose.connection.close();
            return;
        }
        
        console.log('✅ Owner found!');
        console.log('ID:', user._id.toString());
        console.log('Username:', user.username);
        console.log('Email:', user.email);
        console.log('Domain:', user.domain);
        console.log('');
        
        // Step 2: Verify password
        console.log('Step 2: Verifying password...');
        const isPasswordValid = await user.isPasswordCorrect(password);
        
        console.log('Password verification result:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('❌ Invalid user credentials');
            console.log('');
            console.log('🔧 Let me check the stored password hash...');
            console.log('Stored hash length:', user.password.length);
            console.log('Hash starts with:', user.password.substring(0, 10) + '...');
            
            // Let's reset the password
            console.log('');
            console.log('🔄 Resetting password...');
            const bcrypt = (await import('bcrypt')).default;
            const newHashedPassword = await bcrypt.hash(password, 10);
            
            await Owner.updateOne(
                { _id: user._id },
                { password: newHashedPassword }
            );
            
            console.log('✅ Password reset successfully');
            
            // Test again
            const updatedUser = await Owner.findOne({ email });
            const isNewPasswordValid = await updatedUser.isPasswordCorrect(password);
            console.log('New password verification result:', isNewPasswordValid);
            
        } else {
            console.log('✅ Password is correct! Login should work.');
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

testOwnerLogin();

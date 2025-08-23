import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Owner from './src/models/owner.model.js';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testNewOwnerLogin() {
    try {
        // Connect to MongoDB
        const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Test credentials
        const testEmail = 'newowner@codesecure.com';
        const testPassword = 'NewOwner@123456';

        console.log('\n🔍 Testing new owner login...');
        console.log('Email:', testEmail);
        console.log('Password:', testPassword);

        // Find the owner
        const owner = await Owner.findOne({ email: testEmail });
        
        if (!owner) {
            console.log('❌ Owner not found with email:', testEmail);
            return;
        }

        console.log('\n✅ Owner found:');
        console.log('ID:', owner._id);
        console.log('Username:', owner.username);
        console.log('Email:', owner.email);
        console.log('Full Name:', owner.fullname);
        console.log('Role:', owner.role);
        console.log('Password Hash:', owner.password);

        // Test password verification
        const isPasswordValid = await bcrypt.compare(testPassword, owner.password);
        console.log('\n🔐 Password verification:', isPasswordValid ? '✅ VALID' : '❌ INVALID');

        if (!isPasswordValid) {
            console.log('\n🔧 Fixing password hash...');
            const saltRounds = 10;
            const newHashedPassword = await bcrypt.hash(testPassword, saltRounds);
            
            await Owner.findByIdAndUpdate(owner._id, { 
                password: newHashedPassword 
            });
            
            console.log('✅ Password hash updated successfully');
            
            // Verify the fix
            const updatedOwner = await Owner.findById(owner._id);
            const isNewPasswordValid = await bcrypt.compare(testPassword, updatedOwner.password);
            console.log('🔐 New password verification:', isNewPasswordValid ? '✅ VALID' : '❌ INVALID');
        }

        // Test the isPasswordCorrect method if it exists
        if (typeof owner.isPasswordCorrect === 'function') {
            console.log('\n🧪 Testing isPasswordCorrect method...');
            const methodResult = await owner.isPasswordCorrect(testPassword);
            console.log('Method result:', methodResult ? '✅ VALID' : '❌ INVALID');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

testNewOwnerLogin();

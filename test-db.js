import dotenv from 'dotenv';
import connectDB from './src/db/index.js';
import User from './src/models/user.model.js';

dotenv.config();

async function testDatabase() {
    try {
        // Connect to database
        await connectDB();
        
        // Test creating a user
        const testUser = {
            username: 'testadmin',
            email: 'admin@test.com',
            fullname: 'Test Admin',
            avatar: 'https://example.com/avatar.jpg',
            password: 'admin123',
            role: 'admin'
        };
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: testUser.email });
        if (existingUser) {
            console.log('User already exists:', existingUser.email);
            await User.deleteOne({ email: testUser.email });
            console.log('Deleted existing user for testing');
        }
        
        // Create new user
        const newUser = await User.create(testUser);
        console.log('User created successfully:', newUser.email);
        console.log('User ID:', newUser._id);
        
        // Test password comparison
        const isPasswordCorrect = await newUser.isPasswordCorrect('admin123');
        console.log('Password verification:', isPasswordCorrect);
        
        // Clean up
        await User.deleteOne({ _id: newUser._id });
        console.log('Test user deleted');
        
        console.log('✅ Database is working properly!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
        process.exit(1);
    }
}

testDatabase();

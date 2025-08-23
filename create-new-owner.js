import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Owner from './src/models/owner.model.js';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get MongoDB connection string from environment
const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;

async function createOwner() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Owner details (you can modify these)
        const ownerData = {
            username: 'newowner',
            email: 'newowner@codesecure.com',
            fullname: 'New Owner',
            avatar: 'https://example.com/avatar.jpg', // Default avatar
            password: 'NewOwner@123456', // Will be hashed
            role: 'owner'
        };

        // Check if owner already exists
        const existingOwner = await Owner.findOne({
            $or: [
                { email: ownerData.email },
                { username: ownerData.username }
            ]
        });

        if (existingOwner) {
            console.log('Owner already exists:');
            console.log('ID:', existingOwner._id);
            console.log('Username:', existingOwner.username);
            console.log('Email:', existingOwner.email);
            console.log('Full Name:', existingOwner.fullname);
            console.log('Role:', existingOwner.role);
            return;
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(ownerData.password, saltRounds);

        // Create new owner
        const newOwner = new Owner({
            ...ownerData,
            password: hashedPassword
        });

        // Save to database
        const savedOwner = await newOwner.save();

        console.log('✅ New Owner created successfully!');
        console.log('Details:');
        console.log('ID:', savedOwner._id);
        console.log('Username:', savedOwner.username);
        console.log('Email:', savedOwner.email);
        console.log('Full Name:', savedOwner.fullname);
        console.log('Role:', savedOwner.role);
        console.log('Permissions:', savedOwner.permissions);
        
        console.log('\n📝 Login Credentials:');
        console.log('Email:', ownerData.email);
        console.log('Password:', ownerData.password);

    } catch (error) {
        console.error('❌ Error creating owner:', error.message);
        if (error.code === 11000) {
            console.error('Duplicate key error - owner with this email/username already exists');
        }
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the function
createOwner();

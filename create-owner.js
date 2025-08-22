import mongoose from 'mongoose';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

async function createOwner() {
    try {
        // Connect to MongoDB
        const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
        
        // Import the Owner model
        const Owner = (await import('./src/models/owner.model.js')).default;
        
        // Owner credentials
        const ownerData = {
            username: 'owner_admin',
            email: 'owner@codesecure.com',
            fullname: 'System Owner',
            password: 'Owner@123456',
            domain: 'codesecure.com',
            avatar: 'https://via.placeholder.com/150/007bff/ffffff?text=OWN'
        };
        
        console.log('=== CREATING OWNER ACCOUNT ===');
        console.log('Username:', ownerData.username);
        console.log('Email:', ownerData.email);
        console.log('Password:', ownerData.password);
        console.log('Domain:', ownerData.domain);
        console.log('');
        
        // Check if owner already exists
        const existingOwner = await Owner.findOne({
            $or: [
                { username: ownerData.username },
                { email: ownerData.email }
            ]
        });
        
        if (existingOwner) {
            console.log('❌ Owner already exists!');
            console.log('Existing owner details:');
            console.log('ID:', existingOwner._id.toString());
            console.log('Username:', existingOwner.username);
            console.log('Email:', existingOwner.email);
            console.log('Fullname:', existingOwner.fullname);
            console.log('Domain:', existingOwner.domain);
            console.log('Created At:', existingOwner.createdAt);
            
            await mongoose.connection.close();
            return;
        }
        
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(ownerData.password, saltRounds);
        
        // Create new owner
        const newOwner = new Owner({
            username: ownerData.username,
            email: ownerData.email,
            fullname: ownerData.fullname,
            password: hashedPassword,
            domain: ownerData.domain,
            avatar: ownerData.avatar
        });
        
        // Save to database
        const savedOwner = await newOwner.save();
        
        console.log('✅ Owner created successfully!');
        console.log('');
        console.log('=== OWNER CREDENTIALS ===');
        console.log('ID:', savedOwner._id.toString());
        console.log('Username:', savedOwner.username);
        console.log('Email:', savedOwner.email);
        console.log('Password:', ownerData.password);
        console.log('Fullname:', savedOwner.fullname);
        console.log('Domain:', savedOwner.domain);
        console.log('Created At:', savedOwner.createdAt);
        console.log('');
        console.log('=== LOGIN INSTRUCTIONS ===');
        console.log('1. Go to: http://localhost:3000/login');
        console.log('2. Use email:', savedOwner.email);
        console.log('3. Use password:', ownerData.password);
        console.log('4. You will be redirected to the owner dashboard');
        console.log('');
        
        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        
    } catch (error) {
        console.error('Error creating owner:', error);
        process.exit(1);
    }
}

createOwner();

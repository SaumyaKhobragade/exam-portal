import mongoose from 'mongoose';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function updateOwnerDomain() {
    try {
        // Connect to MongoDB
        const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
        
        // Import models
        const Owner = (await import('./src/models/owner.model.js')).default;
        
        // Update domain for the owner
        await Owner.updateOne(
            { email: 'owner@codesecure.com' },
            { domain: 'codesecure.com' }
        );
        
        console.log('✅ Owner domain updated to: codesecure.com');
        
        // Verify the update
        const owner = await Owner.findOne({ email: 'owner@codesecure.com' });
        console.log('Updated owner details:');
        console.log('Email:', owner.email);
        console.log('Domain:', owner.domain);
        
        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateOwnerDomain();

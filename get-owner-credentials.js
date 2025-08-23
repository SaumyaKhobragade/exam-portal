import mongoose from 'mongoose';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function getOwnerCredentials() {
    try {
        // Connect to MongoDB
        const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
        
        // Import the Owner model
        const Owner = (await import('./src/models/owner.model.js')).default;
        
        // Find all owners
        const owners = await Owner.find({});
        
        console.log('=== EXISTING OWNER ACCOUNTS ===');
        console.log('Total owners found:', owners.length);
        console.log('');
        
        if (owners.length > 0) {
            for (let i = 0; i < owners.length; i++) {
                const owner = owners[i];
                console.log(`--- Owner ${i + 1} ---`);
                console.log('ID:', owner._id.toString());
                console.log('Username:', owner.username);
                console.log('Email:', owner.email);
                console.log('Fullname:', owner.fullname);
                console.log('Domain:', owner.domain || 'NOT SET');
                console.log('Avatar:', owner.avatar);
                console.log('Created At:', owner.createdAt);
                console.log('Updated At:', owner.updatedAt);
                console.log('');
                
                // Update domain if missing
                if (!owner.domain) {
                    console.log('🔧 Updating missing domain...');
                    owner.domain = 'codesecure.com';
                    await owner.save();
                    console.log('✅ Domain updated to:', owner.domain);
                    console.log('');
                }
            }
            
            console.log('=== LOGIN CREDENTIALS ===');
            const firstOwner = owners[0];
            console.log('🔑 Use these credentials to login:');
            console.log('Email:', firstOwner.email);
            console.log('Password: Owner@123456 (default password)');
            console.log('');
            console.log('🌐 Login URL: http://localhost:3000/login');
            console.log('📊 After login, you will be redirected to: /owner-dashboard');
            
        } else {
            console.log('❌ No owner accounts found. Creating a new one...');
            
            // Create new owner if none exists
            const newOwner = new Owner({
                username: 'owner_admin',
                email: 'owner@codesecure.com',
                fullname: 'System Owner',
                password: await bcrypt.hash('Owner@123456', 10),
                domain: 'codesecure.com',
                avatar: 'https://via.placeholder.com/150/007bff/ffffff?text=OWN'
            });
            
            const savedOwner = await newOwner.save();
            
            console.log('✅ New owner created!');
            console.log('ID:', savedOwner._id.toString());
            console.log('Email:', savedOwner.email);
            console.log('Password: Owner@123456');
        }
        
        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

getOwnerCredentials();

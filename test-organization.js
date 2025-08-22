import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './src/models/admin.model.js';

dotenv.config();

async function checkOrganizations() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database');
        
        // Get all admins and their organizations
        const admins = await Admin.find({}, 'fullname email organization').lean();
        
        console.log('\n=== Current Admins and Organizations ===');
        if (admins.length === 0) {
            console.log('No admins found in database');
        } else {
            admins.forEach((admin, index) => {
                console.log(`${index + 1}. ${admin.fullname} (${admin.email}) - Organization: "${admin.organization}"`);
            });
        }
        
        // Get unique organizations
        const organizations = await Admin.distinct('organization');
        console.log('\n=== Available Organizations ===');
        if (organizations.length === 0) {
            console.log('No organizations found');
        } else {
            organizations.forEach((org, index) => {
                console.log(`${index + 1}. "${org}"`);
            });
        }
        
        await mongoose.disconnect();
        console.log('\nDisconnected from database');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkOrganizations();

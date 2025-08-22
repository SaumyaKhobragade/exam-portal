import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ApprovedDomain from './src/models/approvedDomain.model.js';
import Admin from './src/models/admin.model.js';

dotenv.config();

async function testDomainSystem() {
    try {
        // Connect to database
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI not found in environment variables');
        }
        
        await mongoose.connect(mongoUri + 'testing');
        console.log('Connected to database');
        
        console.log('\n=== Domain-Based Registration System Test ===\n');
        
        // Check approved domains
        const approvedDomains = await ApprovedDomain.find({ isActive: true });
        console.log('📋 Current Approved Domains:');
        if (approvedDomains.length === 0) {
            console.log('   ❌ No approved domains found');
            console.log('   💡 To test the system:');
            console.log('      1. Login as owner');
            console.log('      2. Approve an exam request (this creates an approved domain)');
            console.log('      3. Or manually create an admin through owner dashboard');
        } else {
            approvedDomains.forEach((domain, index) => {
                console.log(`   ${index + 1}. Domain: "${domain.domain}"`);
                console.log(`      Organization: ${domain.organizationName}`);
                console.log(`      Contact: ${domain.contactPerson}`);
                console.log(`      Created: ${domain.createdAt.toLocaleDateString()}`);
                console.log('');
            });
        }
        
        // Check admins and their domains
        const admins = await Admin.find({}, 'fullname email domain organization').lean();
        console.log('👨‍💼 Current Admins:');
        if (admins.length === 0) {
            console.log('   ❌ No admins found');
        } else {
            admins.forEach((admin, index) => {
                console.log(`   ${index + 1}. ${admin.fullname} (${admin.email})`);
                console.log(`      Domain: ${admin.domain || 'Not set'}`);
                console.log(`      Organization: ${admin.organization}`);
                console.log('');
            });
        }
        
        console.log('🔧 How the new system works:');
        console.log('   1. When owner approves exam request → domain gets approved');
        console.log('   2. When owner creates admin → domain gets approved'); 
        console.log('   3. Users can only register with emails from approved domains');
        console.log('   4. Domain extracted automatically from email address');
        console.log('   5. More secure than organization name checking');
        
        console.log('\n📝 Example test cases:');
        console.log('   ✅ Valid: student@university.edu (if university.edu is approved)');
        console.log('   ❌ Invalid: user@gmail.com (personal emails not allowed)');
        console.log('   ❌ Invalid: test@random-org.com (domain not approved)');
        
        await mongoose.disconnect();
        console.log('\n✅ Test completed - Database disconnected');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testDomainSystem();

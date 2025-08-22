import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ApprovedDomain from './src/models/approvedDomain.model.js';
import Admin from './src/models/admin.model.js';
import Owner from './src/models/owner.model.js';
import User from './src/models/user.model.js';

dotenv.config();

async function setupTestData() {
    try {
        await mongoose.connect(process.env.MONGO_URI + 'testing');
        console.log('🔗 Connected to database');
        
        console.log('\n🧪 Setting up test data for domain validation...\n');
        
        // 1. Ensure owner exists
        let owner = await Owner.findOne({});
        if (!owner) {
            console.log('📝 Creating test owner...');
            owner = await Owner.create({
                username: 'owner',
                email: 'owner@examportal.com',
                fullname: 'System Owner',
                password: 'owner123',
                role: 'owner',
                avatar: 'https://res.cloudinary.com/dz89s3j1b/image/upload/v1735028282/default-avatar.png'
            });
            console.log('✅ Owner created: owner@examportal.com / owner123');
        } else {
            console.log('✅ Owner already exists');
        }
        
        // 2. Create test admin and approved domain
        const testDomain = 'testuniversity.edu';
        console.log(`\n📚 Creating test admin for domain: ${testDomain}`);
        
        // Check if admin already exists
        let testAdmin = await Admin.findOne({ email: `admin@${testDomain}` });
        if (!testAdmin) {
            testAdmin = await Admin.create({
                username: 'testadmin',
                email: `admin@${testDomain}`,
                fullname: 'Test Admin',
                password: 'admin123',
                organization: 'Test University',
                domain: testDomain,
                role: 'admin',
                avatar: 'https://res.cloudinary.com/dz89s3j1b/image/upload/v1735028282/default-avatar.png',
                createdBy: owner._id
            });
            console.log(`✅ Test admin created: admin@${testDomain} / admin123`);
        } else {
            console.log('✅ Test admin already exists');
        }
        
        // 3. Create approved domain
        let approvedDomain = await ApprovedDomain.findOne({ domain: testDomain });
        if (!approvedDomain) {
            approvedDomain = await ApprovedDomain.create({
                domain: testDomain,
                organizationName: 'Test University',
                contactPerson: 'Test Admin',
                approvedBy: owner._id,
                adminId: testAdmin._id,
                isActive: true
            });
            console.log(`✅ Approved domain created: ${testDomain}`);
        } else {
            console.log('✅ Approved domain already exists');
        }
        
        // 4. Show current approved domains
        const allDomains = await ApprovedDomain.find({ isActive: true });
        console.log('\n📋 Current approved domains:');
        allDomains.forEach((domain, index) => {
            console.log(`   ${index + 1}. ${domain.domain} (${domain.organizationName})`);
        });
        
        // 5. Test scenarios
        console.log('\n🧪 Test Scenarios:');
        console.log('\n✅ VALID REGISTRATION:');
        console.log(`   Email: student@${testDomain}`);
        console.log(`   Should work because ${testDomain} is approved`);
        
        console.log('\n❌ INVALID REGISTRATION:');
        console.log('   Email: user@gmail.com');
        console.log('   Should fail because gmail.com is not approved');
        
        console.log('\n🔐 Login Credentials:');
        console.log('   Owner: owner@examportal.com / owner123');
        console.log(`   Admin: admin@${testDomain} / admin123`);
        
        console.log('\n🌐 Testing URLs:');
        console.log('   Registration: http://localhost:3000/login (click "Create Account")');
        console.log('   Owner Dashboard: http://localhost:3000/owner-dashboard');
        console.log('   Admin Dashboard: http://localhost:3000/admin-dashboard');
        
        await mongoose.disconnect();
        console.log('\n✅ Test setup completed!');
        
    } catch (error) {
        console.error('❌ Error setting up test data:', error.message);
    }
}

setupTestData();

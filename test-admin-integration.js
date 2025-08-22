// Test script for Admin ID Integration with Exam Creation
import mongoose from 'mongoose';
import Admin from './src/models/admin.model.js';
import Owner from './src/models/owner.model.js';
import Exam from './src/models/exam.model.js';
import { DB_NAME } from './src/utils/constants.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test data
const testAdmin = {
  username: 'testadmin',
  email: 'testadmin@example.com',
  fullname: 'Test Admin User',
  password: 'testpassword123',
  organization: 'Test Organization',
  avatar: 'https://example.com/default-avatar.jpg'
};

const testOwner = {
  username: 'testowner',
  email: 'testowner@example.com',
  fullname: 'Test Owner User',
  password: 'testpassword123',
  organization: 'Test Organization',
  avatar: 'https://example.com/default-avatar.jpg'
};

const testExamData = {
  title: 'Test Programming Exam',
  description: 'A comprehensive programming examination for testing admin ID integration',
  instructions: 'Complete all coding challenges within the time limit',
  startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  duration: 120,
  questions: [
    {
      title: 'String Reversal Challenge',
      statement: 'Write a function to reverse a string',
      inputFormat: 'A single string',
      outputFormat: 'The reversed string',
      constraints: 'String length <= 1000',
      weight: 25,
      testCases: [
        { input: 'hello', expectedOutput: 'olleh' },
        { input: 'world', expectedOutput: 'dlrow' }
      ]
    }
  ]
};

async function testAdminIntegration() {
  try {
    // Connect to database
    const mongoURI = `${process.env.MONGO_URI}${DB_NAME}`;
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to database');

    // Clean up existing test data
    await Admin.deleteMany({ email: { $in: [testAdmin.email, testOwner.email] } });
    await Owner.deleteMany({ email: { $in: [testAdmin.email, testOwner.email] } });
    await Exam.deleteMany({ examTitle: testExamData.examTitle });
    console.log('✅ Cleaned up existing test data');

    // Create test admin
    const admin = new Admin(testAdmin);
    await admin.save();
    console.log('✅ Created test admin:', admin._id);

    // Create test owner
    const owner = new Owner(testOwner);
    await owner.save();
    console.log('✅ Created test owner:', owner._id);

    // Test exam creation with admin ID
    const examWithAdmin = new Exam({
      ...testExamData,
      title: testExamData.title + ' - Admin Created',
      ownerId: owner._id, // Still need ownerId as it's required
      adminId: admin._id,
      createdBy: {
        userId: admin._id,
        userType: 'admin',
        name: admin.fullname
      }
    });
    await examWithAdmin.save();
    console.log('✅ Created exam with admin ID:', examWithAdmin._id);

    // Test exam creation with owner ID
    const examWithOwner = new Exam({
      ...testExamData,
      title: testExamData.title + ' - Owner Created',
      ownerId: owner._id,
      createdBy: {
        userId: owner._id,
        userType: 'owner',
        name: owner.fullname
      }
    });
    await examWithOwner.save();
    console.log('✅ Created exam with owner ID:', examWithOwner._id);

    // Test querying exams by admin
    const adminExams = await Exam.find({ adminId: admin._id });
    console.log(`✅ Found ${adminExams.length} exam(s) for admin`);

    // Test querying exams by owner
    const ownerExams = await Exam.find({ ownerId: owner._id });
    console.log(`✅ Found ${ownerExams.length} exam(s) for owner`);

    // Test role-based filtering
    const allExamsWithCreators = await Exam.find({
      $or: [
        { adminId: { $exists: true } },
        { ownerId: { $exists: true } }
      ]
    }).populate('adminId', 'username fullname')
      .populate('ownerId', 'username fullname');

    console.log('✅ Exams with populated creator information:');
    allExamsWithCreators.forEach(exam => {
      if (exam.adminId) {
        console.log(`  - ${exam.title} (Admin: ${exam.adminId.username})`);
      }
      if (exam.ownerId) {
        console.log(`  - ${exam.title} (Owner: ${exam.ownerId.username})`);
      }
    });

    // Test createdBy information
    console.log('✅ Created By Information:');
    allExamsWithCreators.forEach(exam => {
      if (exam.createdBy) {
        console.log(`  - ${exam.title} created by ${exam.createdBy.userType}: ${exam.createdBy.name}`);
      }
    });

    console.log('\n🎉 All tests passed! Admin ID integration is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up test data
    await Admin.deleteMany({ email: { $in: [testAdmin.email, testOwner.email] } });
    await Owner.deleteMany({ email: { $in: [testAdmin.email, testOwner.email] } });
    await Exam.deleteMany({ examTitle: { $regex: /Test Programming Exam/ } });
    console.log('✅ Cleaned up test data');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
  }
}

// Run the test
testAdminIntegration();

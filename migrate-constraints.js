// Migration script to convert constraints from string to array format
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://saptanshuwanjari63:Saptanshu%4012@cluster0.zwapfm8.mongodb.net/testing');
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// Define the exam schema
const examSchema = new mongoose.Schema({
    questions: [{
        constraints: mongoose.Schema.Types.Mixed // Allow both string and array
    }]
}, { strict: false });

const Exam = mongoose.model('Exam', examSchema);

async function migrateConstraints() {
    try {
        console.log('Starting constraints migration...');
        
        // Find all exams
        const exams = await Exam.find({});
        console.log(`Found ${exams.length} exams to process`);
        
        let updatedCount = 0;
        
        for (const exam of exams) {
            let examModified = false;
            
            if (exam.questions && exam.questions.length > 0) {
                for (let i = 0; i < exam.questions.length; i++) {
                    const question = exam.questions[i];
                    
                    if (question.constraints && typeof question.constraints === 'string') {
                        console.log(`Converting constraints for exam ${exam._id}, question ${i + 1}`);
                        console.log('Original constraints:', question.constraints);
                        
                        let constraintsArray = [];
                        
                        try {
                            // Try to parse as JSON first
                            constraintsArray = JSON.parse(question.constraints);
                            if (!Array.isArray(constraintsArray)) {
                                constraintsArray = [question.constraints];
                            }
                        } catch (e) {
                            // If JSON parsing fails, split by common delimiters
                            if (question.constraints.includes('\n')) {
                                constraintsArray = question.constraints.split('\n').filter(c => c.trim());
                            } else if (question.constraints.includes('•')) {
                                constraintsArray = question.constraints.split('•').filter(c => c.trim());
                            } else if (question.constraints.includes('-')) {
                                constraintsArray = question.constraints.split('-').filter(c => c.trim());
                            } else {
                                constraintsArray = [question.constraints];
                            }
                        }
                        
                        // Clean up the constraints
                        constraintsArray = constraintsArray.map(c => c.trim().replace(/^[-•*]\s*/, ''));
                        
                        exam.questions[i].constraints = constraintsArray;
                        examModified = true;
                        
                        console.log('New constraints array:', constraintsArray);
                    }
                }
            }
            
            if (examModified) {
                await exam.save();
                updatedCount++;
                console.log(`Updated exam ${exam._id}`);
            }
        }
        
        console.log(`Migration completed. Updated ${updatedCount} exams.`);
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
}

// Run the migration
connectDB().then(() => {
    migrateConstraints();
});

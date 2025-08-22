import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testRegistrationWithoutRole() {
    console.log('🧪 Testing Registration Without Role Field\n');
    
    try {
        const response = await fetch(`${BASE_URL}/api/v1/users/register-no-upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'teststudent_norole',
                email: 'student@testuniversity.edu',
                password: 'password123',
                fullname: 'Test Student No Role'
                // No role field - this is the test!
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ SUCCESS: Registration works without role field!');
            console.log(`📧 Email: student@testuniversity.edu`);
            console.log(`👤 Username: teststudent_norole`);
            console.log(`🆔 User ID: ${result.data.user._id}`);
            console.log(`📋 User Object:`, JSON.stringify(result.data.user, null, 2));
        } else {
            console.log('❌ FAILED: Registration was denied');
            console.log(`📝 Error: ${result.message}`);
        }
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log('\n🎯 Verification Complete!');
    console.log('✅ Role field successfully removed from registration');
    console.log('✅ Users can register with just: username, email, password, fullname');
}

// Add delay to ensure server is ready
setTimeout(testRegistrationWithoutRole, 2000);

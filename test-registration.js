import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testDomainValidation() {
    console.log('🧪 Testing Domain-Based Registration System\n');
    
    // Test 1: Valid domain registration
    console.log('✅ TEST 1: Valid Domain Registration');
    console.log('Domain: testuniversity.edu (should be approved)');
    
    try {
        const response = await fetch(`${BASE_URL}/api/v1/users/register-no-upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'teststudent',
                email: 'student@testuniversity.edu',
                password: 'password123',
                fullname: 'Test Student'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('   ✅ SUCCESS: Registration allowed');
            console.log(`   📧 Email: student@testuniversity.edu`);
            console.log(`   🆔 User ID: ${result.data.user._id}`);
        } else {
            console.log('   ❌ FAILED: Registration denied');
            console.log(`   📝 Error: ${result.message}`);
        }
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Invalid domain registration
    console.log('❌ TEST 2: Invalid Domain Registration');
    console.log('Domain: gmail.com (should be rejected)');
    
    try {
        const response = await fetch(`${BASE_URL}/api/v1/users/register-no-upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'invaliduser',
                email: 'user@gmail.com',
                password: 'password123',
                fullname: 'Invalid User'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('   ❌ ERROR: Registration should have been denied!');
        } else {
            console.log('   ✅ SUCCESS: Registration correctly denied');
            console.log(`   📧 Email: user@gmail.com`);
            console.log(`   📝 Error: ${result.message}`);
        }
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Another invalid domain
    console.log('❌ TEST 3: Another Invalid Domain Registration');
    console.log('Domain: randomcompany.com (should be rejected)');
    
    try {
        const response = await fetch(`${BASE_URL}/api/v1/users/register-no-upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'companyuser',
                email: 'employee@randomcompany.com',
                password: 'password123',
                fullname: 'Company User'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('   ❌ ERROR: Registration should have been denied!');
        } else {
            console.log('   ✅ SUCCESS: Registration correctly denied');
            console.log(`   📧 Email: employee@randomcompany.com`);
            console.log(`   📝 Error: ${result.message}`);
        }
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('✅ Valid domain (testuniversity.edu) should allow registration');
    console.log('❌ Invalid domains (gmail.com, randomcompany.com) should be rejected');
    console.log('\n🌐 Manual Testing:');
    console.log('Visit: http://localhost:3000/login');
    console.log('Click "Create Account" and try different email domains');
}

// Add delay to ensure server is ready
setTimeout(testDomainValidation, 2000);

// Simple test script without database imports

async function testLoginEndpoint() {
    try {
        // Test credentials
        const testData = {
            email: 'newowner@codesecure.com',
            password: 'NewOwner@123456'
        };

        console.log('🧪 Testing login endpoint...');
        console.log('URL: http://localhost:3000/api/v1/auth/login');
        console.log('Data:', testData);

        const response = await fetch('http://localhost:3000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        console.log('\n📡 Response Status:', response.status);
        console.log('Response Status Text:', response.statusText);

        const result = await response.json();
        console.log('\n📄 Response Body:');
        console.log(JSON.stringify(result, null, 2));

        if (response.ok) {
            console.log('\n✅ Login successful!');
            console.log('User Type:', result.data?.userType);
            console.log('Redirect To:', result.data?.redirectTo);
        } else {
            console.log('\n❌ Login failed!');
            console.log('Error Message:', result.message);
        }

    } catch (error) {
        console.error('❌ Network Error:', error.message);
        console.log('\n💡 Make sure the server is running on http://localhost:3000');
    }
}

testLoginEndpoint();

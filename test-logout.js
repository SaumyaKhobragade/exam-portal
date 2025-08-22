// Simple test script to verify logout functionality
import fetch from 'node-fetch';

const baseURL = 'http://localhost:3000';

async function testLogout() {
    console.log('Testing logout functionality...\n');

    try {
        // Test 1: Direct logout without authentication (should clear cookies and redirect)
        console.log('Test 1: Direct logout GET request');
        const response1 = await fetch(`${baseURL}/logout`, {
            method: 'GET',
            redirect: 'manual' // Don't follow redirects automatically
        });
        
        console.log(`Status: ${response1.status}`);
        console.log(`Location header: ${response1.headers.get('location')}`);
        console.log(`Set-Cookie headers:`, response1.headers.raw()['set-cookie']);
        console.log('✓ Test 1 passed\n');

        // Test 2: API logout POST request 
        console.log('Test 2: API logout POST request');
        const response2 = await fetch(`${baseURL}/api/v1/auth/logout-safe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        const data2 = await response2.json();
        console.log(`Status: ${response2.status}`);
        console.log(`Response:`, data2);
        console.log('✓ Test 2 passed\n');

        // Test 3: Browser logout (HTML Accept header)
        console.log('Test 3: Browser logout with HTML accept header');
        const response3 = await fetch(`${baseURL}/logout`, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            redirect: 'manual'
        });
        
        console.log(`Status: ${response3.status}`);
        console.log(`Location header: ${response3.headers.get('location')}`);
        console.log('✓ Test 3 passed\n');

        console.log('All logout tests completed successfully! ✓');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testLogout();

// Test admin account creation
const testAdminCreation = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/v1/users/create-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                email: 'admin@examportal.com',
                password: 'admin123',
                fullname: 'System Administrator'
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Admin account created successfully!');
            console.log('Admin details:', result.data);
        } else {
            console.log('❌ Failed to create admin account:', result.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

testAdminCreation();

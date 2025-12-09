const fetch = require('node-fetch');

const createAdminUser = async () => {
    try {
        console.log('Creating default admin user...');

        const response = await fetch('http://localhost:5000/api/users/seed-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Admin user created successfully!');
            console.log('Email:', data.email);
            console.log('Password:', data.password);
        } else {
            const error = await response.json();
            console.log('⚠️ ', error.message);
            if (error.message.includes('already exists')) {
                console.log('Admin user already exists - you can use:');
                console.log('Email: admin@taskflow.com');
                console.log('Password: admin123');
            }
        }
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    }
};

// Run the script
createAdminUser();
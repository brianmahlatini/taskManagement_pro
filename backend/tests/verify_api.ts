import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const API_URL = 'http://localhost:5000/api';
let token = '';
let boardId = '';
let listId = '';
let cardId = '';

const runVerification = async () => {
    try {
        console.log('Starting verification...');

        // 1. Register
        const email = `test${Date.now()}@example.com`;
        console.log(`Registering user: ${email}`);
        await axios.post(`${API_URL}/auth/register`, {
            name: 'Test User',
            email,
            password: 'password123',
        });

        // 2. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password: 'password123',
        });
        token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
        console.log('Logged in.');

        // 3. Create Board
        console.log('Creating board...');
        const boardRes = await axios.post(`${API_URL}/boards`, { title: 'Test Board' }, authHeaders);
        boardId = boardRes.data._id;
        console.log(`Board created: ${boardId}`);

        // 4. Create List
        console.log('Creating list...');
        // Note: My implementation of createList takes boardId in params
        const listRes = await axios.post(`${API_URL}/boards/${boardId}/lists`, { title: 'Test List' }, authHeaders);
        listId = listRes.data._id;
        console.log(`List created: ${listId}`);

        // 5. Create Card
        console.log('Creating card...');
        const cardRes = await axios.post(`${API_URL}/lists/${listId}/cards`, { title: 'Test Card' }, authHeaders);
        cardId = cardRes.data._id;
        console.log(`Card created: ${cardId}`);

        // 6. Add Comment
        console.log('Adding comment...');
        await axios.post(`${API_URL}/cards/${cardId}/comments`, { content: 'Test Comment' }, authHeaders);
        console.log('Comment added.');

        // 7. Search
        console.log('Searching...');
        const searchRes = await axios.get(`${API_URL}/search?q=Test`, authHeaders);
        if (searchRes.data.cards.length > 0 || searchRes.data.boards.length > 0) {
            console.log('Search successful.');
        } else {
            console.error('Search failed: No results found.');
        }

        // 8. Upload File
        console.log('Uploading file...');
        const form = new FormData();
        const filePath = path.join(__dirname, 'test_upload.txt');
        fs.writeFileSync(filePath, 'This is a test file.');
        form.append('file', fs.createReadStream(filePath));

        const uploadRes = await axios.post(`${API_URL}/upload`, form, {
            headers: {
                ...authHeaders.headers,
                ...form.getHeaders(),
            },
        });
        console.log(`File uploaded: ${uploadRes.data}`);
        fs.unlinkSync(filePath);

        console.log('Verification completed successfully!');
    } catch (error: any) {
        console.error('Verification failed:', error.response?.data || error.message);
        process.exit(1);
    }
};

runVerification();

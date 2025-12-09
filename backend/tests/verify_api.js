"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const API_URL = 'http://localhost:5000/api';
let token = '';
let boardId = '';
let listId = '';
let cardId = '';
const runVerification = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Starting verification...');
        // 1. Register
        const email = `test${Date.now()}@example.com`;
        console.log(`Registering user: ${email}`);
        yield axios_1.default.post(`${API_URL}/auth/register`, {
            name: 'Test User',
            email,
            password: 'password123',
        });
        // 2. Login
        console.log('Logging in...');
        const loginRes = yield axios_1.default.post(`${API_URL}/auth/login`, {
            email,
            password: 'password123',
        });
        token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
        console.log('Logged in.');
        // 3. Create Board
        console.log('Creating board...');
        const boardRes = yield axios_1.default.post(`${API_URL}/boards`, { title: 'Test Board' }, authHeaders);
        boardId = boardRes.data._id;
        console.log(`Board created: ${boardId}`);
        // 4. Create List
        console.log('Creating list...');
        // Note: My implementation of createList takes boardId in params
        const listRes = yield axios_1.default.post(`${API_URL}/boards/${boardId}/lists`, { title: 'Test List' }, authHeaders);
        listId = listRes.data._id;
        console.log(`List created: ${listId}`);
        // 5. Create Card
        console.log('Creating card...');
        const cardRes = yield axios_1.default.post(`${API_URL}/lists/${listId}/cards`, { title: 'Test Card' }, authHeaders);
        cardId = cardRes.data._id;
        console.log(`Card created: ${cardId}`);
        // 6. Add Comment
        console.log('Adding comment...');
        yield axios_1.default.post(`${API_URL}/cards/${cardId}/comments`, { content: 'Test Comment' }, authHeaders);
        console.log('Comment added.');
        // 7. Search
        console.log('Searching...');
        const searchRes = yield axios_1.default.get(`${API_URL}/search?q=Test`, authHeaders);
        if (searchRes.data.cards.length > 0 || searchRes.data.boards.length > 0) {
            console.log('Search successful.');
        }
        else {
            console.error('Search failed: No results found.');
        }
        // 8. Upload File
        console.log('Uploading file...');
        const form = new form_data_1.default();
        const filePath = path_1.default.join(__dirname, 'test_upload.txt');
        fs_1.default.writeFileSync(filePath, 'This is a test file.');
        form.append('file', fs_1.default.createReadStream(filePath));
        const uploadRes = yield axios_1.default.post(`${API_URL}/upload`, form, {
            headers: Object.assign(Object.assign({}, authHeaders.headers), form.getHeaders()),
        });
        console.log(`File uploaded: ${uploadRes.data}`);
        fs_1.default.unlinkSync(filePath);
        console.log('Verification completed successfully!');
    }
    catch (error) {
        console.error('Verification failed:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        process.exit(1);
    }
});
runVerification();

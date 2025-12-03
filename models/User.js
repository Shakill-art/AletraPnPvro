const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const USERS_FILE = path.join(__dirname, '../data/users.json');

function readUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

module.exports = {
    async register(email, password) {
        const users = readUsers();
        if (users.find(u => u.email === email)) {
            throw new Error('Usuario ya existe');
        }
        const hash = await bcrypt.hash(password, 10);
        users.push({ email, password: hash });
        writeUsers(users);
        return { email };
    },
    async login(email, password) {
        const users = readUsers();
        const user = users.find(u => u.email === email);
        if (!user) throw new Error('Usuario no encontrado');
        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error('Contraseña incorrecta');
        return { email };
    }
};

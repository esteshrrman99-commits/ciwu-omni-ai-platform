const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

class AuthVault {
  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'ciwu-dev-secret-change-now';
    this.encryptionKey = process.env.JWT_SECRET || 'ciwu-dev-encryption-key';
    this.users = new Map();
    this.profiles = new Map();
  }

  async register(username, password) {
    if (this.users.has(username)) {
      throw new Error('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = require('crypto').randomUUID();
    this.users.set(username, { userId, username, password: hashedPassword });
    const token = jwt.sign({ userId, username }, this.secretKey, { expiresIn: '30d' });
    return { token, userId, message: 'Account created successfully' };
  }

  async login(username, password) {
    const user = this.users.get(username);
    if (!user) throw new Error('User not found');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid password');
    const token = jwt.sign({ userId: user.userId, username }, this.secretKey, { expiresIn: '30d' });
    return { token, userId: user.userId, message: 'Login successful' };
  }

  encryptProfile(userId, profileData) {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(profileData), this.encryptionKey).toString();
    this.profiles.set(userId, encrypted);
    return { message: 'Profile encrypted and stored', encrypted: true };
  }

  decryptProfile(userId) {
    const encrypted = this.profiles.get(userId);
    if (!encrypted) return null;
    const bytes = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secretKey);
    } catch(e) {
      return null;
    }
  }
}

module.exports = AuthVault;

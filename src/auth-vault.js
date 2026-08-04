const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

// In production, use a real DB. Here we use a local encrypted JSON file for demo.
const VAULT_FILE = '/tmp/patient_vault.json';

class AuthVault {
  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'ciwu-omni-super-secret-key-change-in-prod';
    this.vaultData = this.loadVault();
  }

  loadVault() {
    if (fs.existsSync(VAULT_FILE)) {
      try {
        const encrypted = fs.readFileSync(VAULT_FILE, 'utf8');
        const decrypted = CryptoJS.AES.decrypt(encrypted, 'master-vault-key').toString(CryptoJS.enc.Utf8);
        return decrypted ? JSON.parse(decrypted) : { users: [], profiles: {} };
      } catch(e) { return { users: [], profiles: {} }; }
    }
    return { users: [], profiles: {} };
  }

  saveVault() {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(this.vaultData), 'master-vault-key').toString();
    fs.writeFileSync(VAULT_FILE, encrypted);
  }

  async register(username, password) {
    if (this.vaultData.users.find(u => u.username === username)) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    this.vaultData.users.push({ username, password: hashedPassword, id: Date.now() });
    this.saveVault();
    return { message: 'User registered. Profile created.' };
  }

  async login(username, password) {
    const user = this.vaultData.users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ userId: user.id, username: user.username }, this.secretKey, { expiresIn: '24h' });
    return { token, userId: user.id };
  }

  // Encrypt patient data before storing
  encryptProfile(userId, profileData) {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(profileData), userId).toString();
    this.vaultData.profiles[userId] = encrypted;
    this.saveVault();
  }

  // Decrypt patient data for viewing
  decryptProfile(userId) {
    const encrypted = this.vaultData.profiles[userId];
    if (!encrypted) return null;
    const decrypted = CryptoJS.AES.decrypt(encrypted, userId).toString(CryptoJS.enc.Utf8);
    return decrypted ? JSON.parse(decrypted) : null;
  }
}

module.exports = AuthVault;

const pool = require('../config/db');

const User = {
  async create({ username, email, password, bio = null, profile_pic = null, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, bio, profile_pic, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, bio, profile_pic, role]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async update(id, { username, email, bio = null, profile_pic = null, password = null }) {
    let query = 'UPDATE users SET username = ?, email = ?, bio = ?';
    const params = [username, email, bio];

    if (profile_pic) {
      query += ', profile_pic = ?';
      params.push(profile_pic);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);
    return this.findById(id);
  },

  async delete(id) {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return true;
  },

  async getAll() {
    const [rows] = await pool.execute('SELECT id, username, email, bio, profile_pic, role FROM users');
    return rows;
  },

  async updateRole(id, role) {
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return this.findById(id);
  }
};

module.exports = User;
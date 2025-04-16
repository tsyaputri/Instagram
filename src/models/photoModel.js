const pool = require('../config/db');

const Photo = {
  async create({ user_id, image_url, caption = null }) {
    const [result] = await pool.execute(
      'INSERT INTO photos (user_id, image_url, caption) VALUES (?, ?, ?)',
      [user_id, image_url, caption]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM photos WHERE id = ?', [id]);
    return rows[0];
  },

  async findByUserId(user_id) {
    const [rows] = await pool.execute('SELECT * FROM photos WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
    return rows;
  },

  async delete(id) {
    await pool.execute('DELETE FROM photos WHERE id = ?', [id]);
    return true;
  },

  async getAll() {
    const [rows] = await pool.execute('SELECT * FROM photos ORDER BY created_at DESC');
    return rows;
  }
};

module.exports = Photo;
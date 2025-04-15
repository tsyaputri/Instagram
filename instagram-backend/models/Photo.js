const db = require('../config/db');

class Photo {
  static async create({ user_id, image_url, caption }) {
    const [result] = await db.execute(
      'INSERT INTO photos (user_id, image_url, caption) VALUES (?, ?, ?)',
      [user_id, image_url, caption]
    );
    return result;
  }

  static async findByUserId(user_id) {
    const [rows] = await db.execute('SELECT * FROM photos WHERE user_id = ?', [user_id]);
    return rows;
  }
}

module.exports = Photo;
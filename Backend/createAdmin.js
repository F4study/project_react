const pool = require('./db');
const bcrypt = require('bcrypt');
const readline = require('readline');

async function createAdmin(username, email, password) {
  const hashed = await bcrypt.hash(password, 10);
  const sql = 'INSERT INTO users (role_id, username, email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
  const [res] = await pool.query(sql, [1, username, email, hashed, username]);
  console.log('Admin created with id', res.insertId);
  process.exit(0);
}

if (require.main === module) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Admin username: ', (username) => {
    rl.question('Admin email: ', (email) => {
      rl.question('Admin password: ', async (password) => {
        try {
          await createAdmin(username.trim() || 'admin', email.trim() || 'admin@example.com', password || 'password');
        } catch (err) {
          console.error('Failed to create admin:', err.message || err);
          process.exit(1);
        } finally {
          rl.close();
        }
      });
    });
  });
}

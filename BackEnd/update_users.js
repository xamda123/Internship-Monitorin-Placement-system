const db = require('./config/db');

async function updateUsers() {
  try {
    await db.execute('ALTER TABLE users ADD COLUMN bio TEXT');
    await db.execute('ALTER TABLE users ADD COLUMN location VARCHAR(255)');
    
    await db.execute(
      "UPDATE users SET bio = ?, location = ?, phone = ? WHERE role = 'admin'",
      [
        'Dedicated administrator with 8+ years of experience in healthcare management systems and clinical placement coordination.',
        'Mogadishu, Somalia',
        '+1 (555) 982-1234'
      ]
    );
    
    console.log('Users table updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating users table:', err.message);
    process.exit(1);
  }
}

updateUsers();

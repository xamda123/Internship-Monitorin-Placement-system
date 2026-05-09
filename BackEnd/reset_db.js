const db = require('./config/db');
const bcrypt = require('bcrypt');

async function resetDB() {
  try {
    console.log('Starting database initialization on v2...');
    
    // No need to drop/use since .env already points to v2

    // Table: users
    await db.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'supervisor', 'student') DEFAULT 'student',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table: students
    await db.execute(`
      CREATE TABLE students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        department VARCHAR(100),
        group_id INT,
        hospital_id INT,
        internship_status ENUM('pending', 'active', 'completed', 'dropped') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table: supervisors
    await db.execute(`
      CREATE TABLE supervisors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        staff_id VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        position VARCHAR(100),
        hospital_id INT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table: hospitals
    await db.execute(`
      CREATE TABLE hospitals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hospital_name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        contact_person VARCHAR(255),
        phone VARCHAR(20),
        capacity INT DEFAULT 0,
        available_slots INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table: groups
    await db.execute(`
      CREATE TABLE groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_name VARCHAR(100) NOT NULL,
        academic_year VARCHAR(20),
        department VARCHAR(100),
        supervisor_id INT,
        hospital_id INT,
        start_date DATE,
        end_date DATE,
        status ENUM('active', 'completed', 'upcoming') DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table: assignments
    await db.execute(`
      CREATE TABLE assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT,
        hospital_id INT,
        supervisor_id INT,
        start_date DATE,
        end_date DATE,
        duration VARCHAR(50),
        status ENUM('planned', 'ongoing', 'completed') DEFAULT 'planned',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table: settings
    await db.execute(`
      CREATE TABLE settings (
        id INT PRIMARY KEY,
        system_name VARCHAR(255),
        support_email VARCHAR(255),
        timezone VARCHAR(100),
        language VARCHAR(50)
      )
    `);

    console.log('Tables recreated successfully.');

    // Seed Settings
    await db.execute(`
      INSERT INTO settings (id, system_name, support_email, timezone, language) 
      VALUES (1, 'InternPortal', 'support@internportal.com', 'Africa/Mogadishu', 'English')
    `);

    // Recreate Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.execute('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)', 
      ['Sarah Jenkins', 'admin@example.com', hashedPassword, 'admin']
    );
    
    console.log('Admin user recreated: admin@example.com / admin123');
    console.log('Settings seeded.');
    console.log('Reset complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting database:', err);
    process.exit(1);
  }
}

resetDB();

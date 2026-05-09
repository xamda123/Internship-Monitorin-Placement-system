const db = require('./config/db');
const bcrypt = require('bcrypt');

async function masterSeed() {
  try {
    console.log('Starting Master Seed...');

    // 1. Clear existing data (optional but good for a clean demo)
    await db.execute('DELETE FROM assignments');
    await db.execute('DELETE FROM students');
    await db.execute('DELETE FROM groups');
    await db.execute('DELETE FROM supervisors');
    await db.execute('DELETE FROM hospitals');
    
    console.log('Existing data cleared.');

    // 2. Seed Hospitals
    const hospitals = [
      ['Madina Hospital', 'Wadajir, Mogadishu', 'Dr. Abdirizak', '+252 61 555111', 50, 20],
      ['Digfer Hospital', 'Hodan, Mogadishu', 'Dr. Mohamed', '+252 61 555222', 100, 45],
      ['Shaafi Hospital', 'Waberi, Mogadishu', 'Dr. Halima', '+252 61 555333', 40, 15],
      ['Banadir Hospital', 'Hamar Jajab, Mogadishu', 'Dr. Yusuf', '+252 61 555444', 120, 30],
      ['Keysaney Hospital', 'Karan, Mogadishu', 'Dr. Hassan', '+252 61 555555', 60, 25]
    ];

    const hospIds = [];
    for (const h of hospitals) {
      const [res] = await db.execute(
        'INSERT INTO hospitals (hospital_name, location, contact_person, phone, capacity, available_slots) VALUES (?, ?, ?, ?, ?, ?)',
        h
      );
      hospIds.push(res.insertId);
    }
    console.log('Hospitals seeded.');

    // 3. Seed Supervisors
    const supervisors = [
      ['Dr. Ahmed Ali', 'SUP001', 'ahmed@internportal.com', 'Clinical Supervisor'],
      ['Dr. Fatuma Ismail', 'SUP002', 'fatuma@internportal.com', 'Academic Supervisor'],
      ['Dr. Omar Sheikh', 'SUP003', 'omar@internportal.com', 'Internship Coordinator'],
      ['Dr. Asha Mohamed', 'SUP004', 'asha@internportal.com', 'Field Supervisor'],
      ['Dr. Liban Farah', 'SUP005', 'liban@internportal.com', 'Clinical Supervisor'],
      ['Dr. Hodan Abdi', 'SUP006', 'hodan@internportal.com', 'Academic Supervisor'],
      ['Dr. Muse Barre', 'SUP007', 'muse@internportal.com', 'Internship Coordinator'],
      ['Dr. Khadra Duale', 'SUP008', 'khadra@internportal.com', 'Field Supervisor']
    ];

    const supIds = [];
    for (const s of supervisors) {
      const [res] = await db.execute(
        'INSERT INTO supervisors (full_name, staff_id, email, supervisor_role, hospital_id) VALUES (?, ?, ?, ?, ?)',
        [s[0], s[1], s[2], s[3], hospIds[Math.floor(Math.random() * hospIds.length)]]
      );
      supIds.push(res.insertId);
    }
    console.log('Supervisors seeded.');

    // 4. Seed Groups
    const groups = [
      ['Group A', '2025-2026', 'Nursing'],
      ['Group B', '2025-2026', 'Medicine'],
      ['Group C', '2025-2026', 'Surgery'],
      ['Group D', '2025-2026', 'Pediatrics'],
      ['Group E', '2025-2026', 'Midwifery'],
      ['Group F', '2025-2026', 'Public Health']
    ];

    const groupIds = [];
    for (const g of groups) {
      const [res] = await db.execute(
        'INSERT INTO groups (group_name, academic_year, department, supervisor_id, hospital_id, status) VALUES (?, ?, ?, ?, ?, ?)',
        [g[0], g[1], g[2], supIds[Math.floor(Math.random() * supIds.length)], hospIds[Math.floor(Math.random() * hospIds.length)], 'active']
      );
      groupIds.push(res.insertId);
    }
    console.log('Groups seeded.');

    // 5. Seed Students (50 students)
    const somaliNames = [
      'Abdirahman Ali', 'Fartun Mohamed', 'Hassan Abdi', 'Hibaq Ahmed', 'Mohamed Osman',
      'Ayanle Farah', 'Nasra Yusuf', 'Mustafe Khalid', 'Zamzam Salad', 'Liban Gure',
      'Safiya Hassan', 'Ismail Bare', 'Hawa Muse', 'Abdiwali Said', 'Nimo Aden',
      'Burhan Hussein', 'Ikran Omar', 'Deqa Ali', 'Salah Adan', 'Layla Isaq',
      'Farhiya Barre', 'Khadija Osman', 'Warsame Nur', 'Asli Duale', 'Barkhad Abshir',
      'Shukri Mohamed', 'Guled Farah', 'Hafsa Ahmed', 'Abdullahi Ali', 'Zaynab Issa',
      'Kaltum Jibril', 'Ridwan Sheikh', 'Muna Daud', 'Dahir Gelle', 'Najma Bile',
      'Bashir Egal', 'Raho Elmi', 'Fuad Gedi', 'Muno Ali', 'Ilyas Hassan',
      'Amina Kahin', 'Abdirizak Mahad', 'Nimco Salad', 'Yasin Abdisalam', 'Siham Ali',
      'Idris Haji', 'Amira Ismail', 'Sakariye Osman', 'Faduma Gedi', 'Jabir Yusuf'
    ];

    const departments = ['Nursing', 'Medicine', 'Surgery', 'Pediatrics', 'Midwifery', 'Public Health'];
    const statuses = ['active', 'pending', 'completed', 'active', 'active'];

    for (let i = 0; i < somaliNames.length; i++) {
      const gId = groupIds[Math.floor(Math.random() * groupIds.length)];
      const hId = hospIds[Math.floor(Math.random() * hospIds.length)];
      
      await db.execute(
        'INSERT INTO students (full_name, student_id, email, phone, department, group_id, hospital_id, internship_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          somaliNames[i],
          `STU2026-${1000 + i}`,
          `${somaliNames[i].toLowerCase().replace(' ', '.')}@example.com`,
          `+252 61 ${Math.floor(100000 + Math.random() * 900000)}`,
          departments[Math.floor(Math.random() * departments.length)],
          gId,
          hId,
          statuses[Math.floor(Math.random() * statuses.length)]
        ]
      );
    }
    console.log('Students (50) seeded.');

    // 6. Seed Assignments
    const today = new Date();
    for (let i = 0; i < groupIds.length; i++) {
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (i * 5));
      const end = new Date(start);
      end.setDate(start.getDate() + 30);

      await db.execute(
        'INSERT INTO assignments (group_id, hospital_id, supervisor_id, start_date, end_date, duration, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          groupIds[i],
          hospIds[i % hospIds.length],
          supIds[i % supIds.length],
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0],
          '30 days',
          i < 4 ? 'ongoing' : 'planned'
        ]
      );
    }
    console.log('Assignments seeded.');

    // 7. Seed Activities
    const sampleActivities = [
      'New student registered: Abdirahman Ali',
      'Supervisor assigned to Group A: Dr. Ahmed Ali',
      'Hospital placement created for Group B at Digfer Hospital',
      'Monthly performance report generated for March',
      'System settings updated by Administrator',
      'New internship group created: Group F',
      'Placement schedule updated for Madina Hospital',
      'Supervisor assigned to Group C: Dr. Omar Sheikh'
    ];

    for (const action of sampleActivities) {
      await db.execute('INSERT INTO activities (action) VALUES (?)', [action]);
    }
    console.log('Activities seeded.');

    console.log('Master Seed Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Master Seed Error:', err);
    process.exit(1);
  }
}

masterSeed();

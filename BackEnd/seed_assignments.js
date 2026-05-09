const db = require('./config/db');

async function seedAssignments() {
  try {
    const [groups] = await db.execute('SELECT id FROM groups LIMIT 2');
    const [hospitals] = await db.execute('SELECT id FROM hospitals LIMIT 2');
    const [supervisors] = await db.execute('SELECT id FROM supervisors LIMIT 2');

    if (groups.length === 0 || hospitals.length === 0) {
      console.log('Not enough data to seed assignments. Please add groups and hospitals first.');
      process.exit(0);
    }

    const today = new Date();
    const startDate1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString().split('T')[0];
    const endDate1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0];

    const startDate2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0];
    const endDate2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15).toISOString().split('T')[0];

    await db.execute(
      'INSERT INTO assignments (group_id, hospital_id, supervisor_id, start_date, end_date, duration, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [groups[0].id, hospitals[0].id, supervisors[0].id, startDate1, endDate1, '10 days', 'ongoing', 'Main clinical rotation']
    );

    await db.execute(
      'INSERT INTO assignments (group_id, hospital_id, supervisor_id, start_date, end_date, duration, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [groups[1].id, hospitals[1].id, supervisors[1].id, startDate2, endDate2, '13 days', 'planned', 'Upcoming pediatrics rotation']
    );

    console.log('Seed assignments created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding assignments:', err.message);
    process.exit(1);
  }
}

seedAssignments();

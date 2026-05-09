const db = require('./config/db');

async function checkTables() {
  try {
    const [tables] = await db.execute('SHOW TABLES');
    console.log('Tables in database:', tables);
    
    // The keys in the result objects depend on the database name
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('Table names:', tableNames);

    const tablesToVerify = ['students', 'supervisors', 'groups', 'hospitals', 'assignments'];
    for (const table of tablesToVerify) {
      if (tableNames.includes(table)) {
        try {
          const [rows] = await db.execute(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`Table ${table} exists. Count: ${rows[0].count}`);
        } catch (err) {
          console.error(`Error querying table ${table}:`, err.message);
        }
      } else {
        console.error(`Table ${table} DOES NOT EXIST in the database.`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
}

checkTables();

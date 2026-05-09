const db = require('../config/db');

exports.createGroup = async (req, res) => {
  try {
    const { group_name, academic_year, department, supervisor_id, hospital_id, start_date, end_date, status } = req.body;
    const [result] = await db.execute(
      'INSERT INTO groups (group_name, academic_year, department, supervisor_id, hospital_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [group_name, academic_year, department, supervisor_id || null, hospital_id || null, start_date || null, end_date || null, status || 'upcoming']
    );
    res.status(201).json({ id: result.insertId, message: 'Group created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating group', error: err.message });
  }
};

exports.getAllGroups = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM groups');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching groups', error: err.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM groups WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Group not found' });
    
    // Also fetch students in this group
    const [students] = await db.execute(
      'SELECT s.* FROM students s JOIN group_students gs ON s.id = gs.student_id WHERE gs.group_id = ?',
      [req.params.id]
    );
    
    const group = rows[0];
    group.students = students;
    
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching group', error: err.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { group_name, academic_year, department, supervisor_id, hospital_id, start_date, end_date, status } = req.body;
    const [result] = await db.execute(
      'UPDATE groups SET group_name=?, academic_year=?, department=?, supervisor_id=?, hospital_id=?, start_date=?, end_date=?, status=? WHERE id=?',
      [group_name, academic_year, department, supervisor_id || null, hospital_id || null, start_date || null, end_date || null, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Group not found' });
    res.json({ message: 'Group updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating group', error: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM groups WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Group not found' });
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting group', error: err.message });
  }
};

exports.addStudentsToGroup = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const groupId = req.params.id;
    const { studentIds } = req.body; // Array of student IDs

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'studentIds array is required' });
    }

    // Insert into group_students
    for (const studentId of studentIds) {
      // Check if student exists
      const [students] = await connection.execute('SELECT id FROM students WHERE id = ?', [studentId]);
      if (students.length > 0) {
         // Insert link
         await connection.execute('INSERT IGNORE INTO group_students (group_id, student_id) VALUES (?, ?)', [groupId, studentId]);
         // Update student's group_id
         await connection.execute('UPDATE students SET group_id = ? WHERE id = ?', [groupId, studentId]);
      }
    }

    await connection.commit();
    res.json({ message: 'Students added to group successfully' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: 'Error adding students to group', error: err.message });
  } finally {
    connection.release();
  }
};

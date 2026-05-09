const db = require('../config/db');

exports.createStudent = async (req, res) => {
  try {
    const { full_name, student_id, email, phone, department, group_id, hospital_id, internship_status } = req.body;
    const [result] = await db.execute(
      'INSERT INTO students (full_name, student_id, email, phone, department, group_id, hospital_id, internship_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [full_name, student_id, email, phone, department, group_id || null, hospital_id || null, internship_status || 'pending']
    );
    res.status(201).json({ id: result.insertId, message: 'Student created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating student', error: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM students');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student', error: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { full_name, student_id, email, phone, department, group_id, hospital_id, internship_status } = req.body;
    const [result] = await db.execute(
      'UPDATE students SET full_name=?, student_id=?, email=?, phone=?, department=?, group_id=?, hospital_id=?, internship_status=? WHERE id=?',
      [full_name, student_id, email, phone, department, group_id || null, hospital_id || null, internship_status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating student', error: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student', error: err.message });
  }
};

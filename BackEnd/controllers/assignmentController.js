const db = require('../config/db');

exports.createAssignment = async (req, res) => {
  try {
    const { group_id, hospital_id, supervisor_id, start_date, end_date, duration, status, notes } = req.body;
    const [result] = await db.execute(
      'INSERT INTO assignments (group_id, hospital_id, supervisor_id, start_date, end_date, duration, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [group_id, hospital_id, supervisor_id || null, start_date || null, end_date || null, duration || null, status || 'planned', notes || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Assignment created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating assignment', error: err.message });
  }
};

exports.getAllAssignments = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM assignments');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assignments', error: err.message });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM assignments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Assignment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assignment', error: err.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { group_id, hospital_id, supervisor_id, start_date, end_date, duration, status, notes } = req.body;
    const [result] = await db.execute(
      'UPDATE assignments SET group_id=?, hospital_id=?, supervisor_id=?, start_date=?, end_date=?, duration=?, status=?, notes=? WHERE id=?',
      [group_id, hospital_id, supervisor_id || null, start_date || null, end_date || null, duration || null, status, notes || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating assignment', error: err.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM assignments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting assignment', error: err.message });
  }
};

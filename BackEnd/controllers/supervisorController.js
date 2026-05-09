const db = require('../config/db');

exports.createSupervisor = async (req, res) => {
  try {
    const { full_name, staff_id, email, phone, supervisor_role, hospital_id, status } = req.body;
    const [result] = await db.execute(
      'INSERT INTO supervisors (full_name, staff_id, email, phone, supervisor_role, hospital_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, staff_id, email, phone, supervisor_role, hospital_id || null, status || 'active']
    );
    res.status(201).json({ id: result.insertId, message: 'Supervisor created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating supervisor', error: err.message });
  }
};

exports.getAllSupervisors = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM supervisors');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching supervisors', error: err.message });
  }
};

exports.getSupervisorById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM supervisors WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Supervisor not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching supervisor', error: err.message });
  }
};

exports.updateSupervisor = async (req, res) => {
  try {
    const { full_name, staff_id, email, phone, supervisor_role, hospital_id, status } = req.body;
    const [result] = await db.execute(
      'UPDATE supervisors SET full_name=?, staff_id=?, email=?, phone=?, supervisor_role=?, hospital_id=?, status=? WHERE id=?',
      [full_name, staff_id, email, phone, supervisor_role, hospital_id || null, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Supervisor not found' });
    res.json({ message: 'Supervisor updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating supervisor', error: err.message });
  }
};

exports.deleteSupervisor = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM supervisors WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Supervisor not found' });
    res.json({ message: 'Supervisor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting supervisor', error: err.message });
  }
};

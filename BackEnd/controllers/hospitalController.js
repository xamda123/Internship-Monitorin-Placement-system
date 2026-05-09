const db = require('../config/db');

exports.createHospital = async (req, res) => {
  try {
    const { hospital_name, location, contact_person, phone, capacity, available_slots, status } = req.body;
    const [result] = await db.execute(
      'INSERT INTO hospitals (hospital_name, location, contact_person, phone, capacity, available_slots, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [hospital_name, location, contact_person, phone, capacity || 0, available_slots || 0, status || 'active']
    );
    res.status(201).json({ id: result.insertId, message: 'Hospital created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating hospital', error: err.message });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM hospitals');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hospitals', error: err.message });
  }
};

exports.getHospitalById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM hospitals WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Hospital not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hospital', error: err.message });
  }
};

exports.updateHospital = async (req, res) => {
  try {
    const { hospital_name, location, contact_person, phone, capacity, available_slots, status } = req.body;
    const [result] = await db.execute(
      'UPDATE hospitals SET hospital_name=?, location=?, contact_person=?, phone=?, capacity=?, available_slots=?, status=? WHERE id=?',
      [hospital_name, location, contact_person, phone, capacity, available_slots, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Hospital not found' });
    res.json({ message: 'Hospital updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating hospital', error: err.message });
  }
};

exports.deleteHospital = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM hospitals WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Hospital not found' });
    res.json({ message: 'Hospital deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting hospital', error: err.message });
  }
};

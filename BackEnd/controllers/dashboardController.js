const db = require('../config/db');

exports.getPlacementTrends = async (req, res) => {
  try {
    // Get last 6 months trend
    const [rows] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        COUNT(id) as students,
        SUM(CASE WHEN internship_status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN internship_status = 'active' THEN 1 ELSE 0 END) as ongoing
      FROM students
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), month
      ORDER BY MIN(created_at) ASC
      LIMIT 6
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching placement trends', error: err.message });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT action, created_at 
      FROM activities 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    // If empty, return some defaults
    if (rows.length === 0) {
      return res.json([
        { action: 'Master Seed system population completed', created_at: new Date() },
        { action: 'Admin dashboard security hardened', created_at: new Date(Date.now() - 3600000) }
      ]);
    }
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching activities', error: err.message });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT s.full_name as student_name, h.hospital_name as assigned_hospital, s.internship_status as status
      FROM students s
      LEFT JOIN hospitals h ON s.hospital_id = h.id
      WHERE s.internship_status = 'pending'
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending approvals', error: err.message });
  }
};

exports.getCompletionRate = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN internship_status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN internship_status = 'active' THEN 1 ELSE 0 END) as ongoing
      FROM students
    `);
    
    const stats = rows[0];
    const completion_percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    
    res.json({
      completed: stats.completed,
      ongoing: stats.ongoing,
      completion_percentage
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching completion rate', error: err.message });
  }
};

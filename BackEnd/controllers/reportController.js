const db = require('../config/db');
const PDFDocument = require('pdfkit');

exports.generateDashboardReport = async (req, res) => {
  try {
    // 1. Fetch data for the report
    const [totalStudents] = await db.execute('SELECT COUNT(*) as count FROM students');
    const [totalSupervisors] = await db.execute('SELECT COUNT(*) as count FROM supervisors');
    const [totalGroups] = await db.execute('SELECT COUNT(*) as count FROM groups');
    const [activeInternships] = await db.execute('SELECT COUNT(*) as count FROM assignments WHERE status = "ongoing"');
    
    const [recentPlacements] = await db.execute(`
      SELECT s.full_name, h.hospital_name, a.status, a.start_date
      FROM assignments a
      JOIN groups g ON a.group_id = g.id
      JOIN students s ON s.group_id = g.id
      JOIN hospitals h ON a.hospital_id = h.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    // 2. Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Internship_System_Report.pdf');

    doc.pipe(res);

    // Header
    doc
      .fillColor('#2563eb')
      .fontSize(24)
      .text('InternPortal Analytics', { align: 'center' })
      .moveDown(0.5);
    
    doc
      .fillColor('#64748b')
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(2);

    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(2);

    // Summary Section
    doc
      .fillColor('#1e293b')
      .fontSize(16)
      .text('Executive Summary', { underline: true })
      .moveDown(1);

    const summaryData = [
      ['Total Students:', totalStudents[0].count],
      ['Total Supervisors:', totalSupervisors[0].count],
      ['Total Groups:', totalGroups[0].count],
      ['Active Internships:', activeInternships[0].count]
    ];

    summaryData.forEach(([label, value]) => {
      doc
        .fillColor('#475569')
        .fontSize(12)
        .text(`${label} `, { continued: true })
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .text(value)
        .font('Helvetica')
        .moveDown(0.5);
    });

    doc.moveDown(2);

    // Recent Placements Table
    doc
      .fillColor('#1e293b')
      .fontSize(16)
      .text('Recent Placements', { underline: true })
      .moveDown(1);

    // Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Student Name', 50, tableTop);
    doc.text('Hospital', 200, tableTop);
    doc.text('Status', 350, tableTop);
    doc.text('Start Date', 450, tableTop);
    
    doc.moveDown(0.5);
    doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

    // Table Rows
    doc.font('Helvetica').fillColor('#475569');
    recentPlacements.forEach((item, index) => {
      const y = doc.y;
      doc.text(item.full_name, 50, y);
      doc.text(item.hospital_name, 200, y);
      doc.text(item.status.toUpperCase(), 350, y);
      doc.text(new Date(item.start_date).toLocaleDateString(), 450, y);
      doc.moveDown(1);
      
      if (index < recentPlacements.length - 1) {
        doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(50, doc.y - 5).lineTo(550, doc.y - 5).stroke();
      }
    });

    // Footer
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .fillColor('#94a3b8')
        .fontSize(8)
        .text(
          'Internship Monitoring & Placement Management System - Confidential',
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
    }

    doc.end();

  } catch (err) {
    console.error('Report Generation Error:', err);
    // Send detailed error to help debugging
    res.status(500).json({ 
      message: 'Error generating report', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

// Real dashboard summary JSON handler
exports.getDashboardSummary = async (req, res) => {
  try {
    const [students] = await db.execute('SELECT COUNT(*) as count FROM students');
    const [supervisors] = await db.execute('SELECT COUNT(*) as count FROM supervisors');
    const [groups] = await db.execute('SELECT COUNT(*) as count FROM groups');
    const [assignments] = await db.execute('SELECT COUNT(*) as count FROM assignments WHERE status = "ongoing"');
    
    res.json({
      totalStudents: students[0]?.count || 0,
      totalSupervisors: supervisors[0]?.count || 0,
      totalGroups: groups[0]?.count || 0,
      activeInternships: assignments[0]?.count || 0
    });
  } catch (err) {
    console.error('Dashboard Summary Error:', err);
    res.status(500).json({ message: 'Error fetching summary' });
  }
};

exports.generateStudentsReport = async (req, res) => {
  try {
    const [students] = await db.execute(`
      SELECT s.full_name, s.student_id, s.department, s.internship_status, h.hospital_name
      FROM students s
      LEFT JOIN hospitals h ON s.hospital_id = h.id
      ORDER BY s.full_name ASC
    `);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Student_Directory_Report.pdf');
    doc.pipe(res);

    // Header
    doc.fillColor('#2563eb').fontSize(20).text('Student Directory Report', { align: 'center' }).moveDown();
    doc.fillColor('#64748b').fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' }).moveDown(2);
    
    // Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e293b');
    doc.text('Name', 50, tableTop);
    doc.text('Student ID', 200, tableTop);
    doc.text('Department', 320, tableTop);
    doc.text('Status', 450, tableTop);

    doc.moveDown(0.5);
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

    // Rows
    doc.font('Helvetica').fillColor('#475569');
    students.forEach((s) => {
      const y = doc.y;
      if (y > 700) doc.addPage();
      doc.text(s.full_name, 50, y, { width: 140 });
      doc.text(s.student_id, 200, y);
      doc.text(s.department || '-', 320, y);
      doc.text((s.internship_status || 'pending').toUpperCase(), 450, y);
      doc.moveDown(1.5);
    });

    doc.end();
  } catch (err) {
    console.error('Students PDF Error:', err);
    res.status(500).json({ message: 'Error generating students report' });
  }
};

exports.getStudentsPerHospital = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT h.hospital_name, COUNT(s.id) as student_count
      FROM hospitals h
      LEFT JOIN assignments a ON a.hospital_id = h.id
      LEFT JOIN groups g ON a.group_id = g.id
      LEFT JOIN students s ON s.group_id = g.id
      GROUP BY h.id, h.hospital_name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hospital stats' });
  }
};

exports.getInternshipStatusBreakdown = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT internship_status as status, COUNT(*) as count
      FROM students
      GROUP BY internship_status
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching status stats' });
  }
};

exports.getSupervisorSummary = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT sup.full_name as supervisor_name, COUNT(DISTINCT a.group_id) as groups_assigned
      FROM supervisors sup
      LEFT JOIN assignments a ON a.supervisor_id = sup.id
      GROUP BY sup.id, sup.full_name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching supervisor stats' });
  }
};

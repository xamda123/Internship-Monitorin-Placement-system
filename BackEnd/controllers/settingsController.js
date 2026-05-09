const db = require("../config/db");

exports.getSettings = async (req, res) => {
    try {
        const [result] = await db.execute("SELECT * FROM settings LIMIT 1");
        res.json(result[0] || {});
    } catch (err) {
        res.status(500).json({ message: "Error fetching settings", error: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    const { system_name, support_email, timezone, language, min_duration_days, max_duration_days, auto_assign_supervisor } = req.body;

    try {
        await db.execute(
            "UPDATE settings SET system_name=?, support_email=?, timezone=?, language=?, min_duration_days=?, max_duration_days=?, auto_assign_supervisor=? WHERE id=1",
            [system_name, support_email, timezone, language, min_duration_days || 30, max_duration_days || 180, auto_assign_supervisor ? 1 : 0]
        );
        res.json({ message: "Settings updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating settings", error: err.message });
    }
};
const pool = require('../helpers/mysql-config');

const getResumen = async (req, res) => {
    const userId = req.query.user_id; // Obtener el ID del usuario desde la query string
    const sql = `
        SELECT 
            l.location_name AS room_name,
            l.location_id,
            MAX(CASE WHEN d.device_type = 'temperature_sensor' THEN sr.value ELSE NULL END) AS temperature,
            SUM(CASE WHEN d.device_type = 'light' AND ls.status = 'on' THEN 1 ELSE 0 END) AS active_lights
        FROM Locations l
        LEFT JOIN Devices d ON l.location_id = d.location_id
        LEFT JOIN SensorReadings sr ON d.device_id = sr.device_id
        LEFT JOIN LightSettings ls ON d.device_id = ls.device_id
        WHERE l.user_id = ?
        GROUP BY l.location_id, l.location_name;
    `;
    try {
        const [rows] = await pool.query(sql, [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "No se encontraron habitaciones para este usuario." });
        }
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getResumen };

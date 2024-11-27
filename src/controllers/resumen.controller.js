const pool = require('../helpers/mysql-config'); // Usamos un pool configurado

const getResumen = async (req, res) => {
    try {
        // Consultar las habitaciones
        const [locations] = await pool.execute(`
            SELECT location_id, location_name, floor
            FROM Locations
        `);

        // Consultar los dispositivos controlables
        const [devices] = await pool.execute(`
            SELECT 
                Devices.device_id,
                Devices.device_name,
                Devices.device_type,
                Locations.location_name,
                Locations.location_id
            FROM Devices
            JOIN Locations ON Devices.location_id = Locations.location_id
            WHERE device_type IN ('light', 'fan')
        `);

        // Consultar los sensores
        const [sensors] = await pool.execute(`
            SELECT 
                Devices.device_id,
                Devices.device_name,
                Devices.device_type,
                Locations.location_name,
                Locations.location_id,
                sr.value AS latest_reading,
                sr.timestamp AS reading_timestamp
            FROM Devices
            JOIN Locations ON Devices.location_id = Locations.location_id
            LEFT JOIN (
                SELECT device_id, MAX(timestamp) AS latest_timestamp
                FROM SensorReadings
                GROUP BY device_id
            ) latest ON Devices.device_id = latest.device_id
            LEFT JOIN SensorReadings sr ON sr.device_id = latest.device_id AND sr.timestamp = latest.latest_timestamp
            WHERE device_type IN ('temperature_sensor', 'light_sensor', 'motion_sensor')
        `);

        // Consultar configuraciones de dispositivos
        const [settings] = await pool.execute(`
            SELECT 
                ds.device_id,
                ds.status AS current_status
            FROM DeviceSettings ds
            INNER JOIN (
                SELECT device_id, MAX(timestamp) AS latest_timestamp
                FROM DeviceSettings
                GROUP BY device_id
            ) latest ON ds.device_id = latest.device_id AND ds.timestamp = latest.latest_timestamp
        `);

        const settingsMap = Object.fromEntries(settings.map(s => [s.device_id, s.current_status]));

        // Añadir estado actual a los dispositivos controlables
        const devicesWithStatus = devices.map(device => ({
            ...device,
            current_status: settingsMap[device.device_id] || 0,
        }));

        res.status(200).json({
            locations,
            devices: devicesWithStatus,
            sensors,
        });
    } catch (error) {
        console.error("Error en la ruta /resumen:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


module.exports = { getResumen };

const connection = require('../helpers/mysql-config');

const getHistoricalData = async (req, res) => {
    try {
        // Consultar datos de temperatura con timestamp
        const [temperatureReadings] = await connection.query(`
            SELECT l.location_name AS room, sr.timestamp, sr.value AS temperature
            FROM SensorReadings sr
            INNER JOIN Devices d ON sr.device_id = d.device_id
            INNER JOIN Locations l ON d.location_id = l.location_id
            WHERE d.device_type = 'temperature_sensor'
            ORDER BY sr.timestamp
        `);

        // Consultar datos de movimiento con timestamp
        const [motionReadings] = await connection.query(`
            SELECT l.location_name AS room, sr.timestamp, sr.value AS movement
            FROM SensorReadings sr
            INNER JOIN Devices d ON sr.device_id = d.device_id
            INNER JOIN Locations l ON d.location_id = l.location_id
            WHERE d.device_type = 'motion_sensor'
            ORDER BY sr.timestamp
        `);

        // Consultar suma de dispositivos activos por habitación
        const [deviceResults] = await connection.query(`
            SELECT 
                l.location_name AS room, 
                SUM(ds.status) AS total_active_devices
            FROM 
                DeviceSettings ds
            INNER JOIN 
                Devices d ON ds.device_id = d.device_id
            INNER JOIN 
                Locations l ON d.location_id = l.location_id
            WHERE 
                d.device_type IN ('light', 'fan') -- Excluir sensores
            GROUP BY 
                l.location_name
            ORDER BY 
                total_active_devices DESC
        `);

        res.json({
            temperatureReadings: temperatureReadings.map(row => ({
                room: row.room,
                timestamp: row.timestamp,
                temperature: row.temperature
            })),
            motionReadings: motionReadings.map(row => ({
                room: row.room,
                timestamp: row.timestamp,
                movement: row.movement
            })),
            devices: deviceResults.map(row => row.total_active_devices),
            rooms: deviceResults.map(row => row.room)
        });
    } catch (err) {
        console.error('Error al obtener datos históricos:', err);
        res.status(500).send('Error en el servidor');
    }
};

module.exports = { getHistoricalData };



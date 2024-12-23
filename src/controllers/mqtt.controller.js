const db = require('../helpers/mysql-config');

// Ruta para insertar múltiples configuraciones de dispositivos
const postDeviceSettings = async (req, res) => {
    const devices = req.body;

    if (!Array.isArray(devices)) {
        return res.status(400).json({ error: 'Se esperaba un arreglo de configuraciones' });
    }

    const query = `
        INSERT INTO DeviceSettings (device_id, status)
        VALUES ?
    `;

    const values = devices.map(device => [device.device_id, device.status]);

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error al insertar configuraciones de dispositivos:', err);
            return res.status(500).json({ error: 'Error al insertar configuraciones de dispositivos' });
        }
        res.status(201).json({ message: 'Datos insertados en DeviceSettings', rowsAffected: result.affectedRows });
    });
};

// Ruta para insertar múltiples lecturas de sensores
const postSensorReadings = async (req, res) => {
    const readings = req.body;

    if (!Array.isArray(readings)) {
        return res.status(400).json({ error: 'Se esperaba un arreglo de lecturas de sensores' });
    }

    const query = `
        INSERT INTO SensorReadings (device_id, value, timestamp)
        VALUES ?
    `;

    const values = readings.map(reading => [reading.device_id, reading.value, reading.timestamp || new Date()]);

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error al insertar lecturas de sensores:', err);
            return res.status(500).json({ error: 'Error al insertar lecturas de sensores' });
        }
        res.status(201).json({ message: 'Datos insertados en SensorReadings', rowsAffected: result.affectedRows });
    });
};

module.exports = {
    postDeviceSettings,
    postSensorReadings,
};

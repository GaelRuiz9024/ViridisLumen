const express = require('express');
const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const cors = require('cors')
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// Rutas
const resumen = require('./src/routes/resumen');
const auth = require('./src/routes/auth');
const historicalData = require('./src/routes/historicalData');
const mqtti=require('./src/routes/mqtt');
app.use(cors())
app.use(express.static('public')); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(
    session({
        secret: 'simple_secret',
        resave: false,
        saveUninitialized: true,
    })
);
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // Permite todos los orígenes
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use('/', auth);
app.use('/', resumen);
app.use('/', historicalData);
app.use('/mqtt', mqtti);

// Servidor HTTP y WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broker MQTT
const mqttClient = mqtt.connect(`mqtt://${process.env.MQTTHOST || 'broker.emqx.io'}`, {
    clientId: 'nodejs_mqtt_client'
});

// Tópicos MQTT
const topicDeviceSettings = 'deviceSettings';
const topicSensorReadings = 'sensorReadings';

// Suscripción a tópicos MQTT
mqttClient.on('connect', () => {
    console.log(`Conectado al broker MQTT`);
    
    mqttClient.subscribe([topicDeviceSettings, topicSensorReadings], (err) => {
        if (err) {
            console.error('Error al suscribirse a los tópicos:', err.message);
        } else {
            console.log(`Suscrito a los tópicos: ${topicDeviceSettings}, ${topicSensorReadings}`);
        }
    });
});

// Manejo de mensajes de MQTT
mqttClient.on('message', async (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        console.log(`Mensaje recibido en ${topic}:`, payload);


        // Opcional: Guardar en el backend si es necesario
        if (topic === topicDeviceSettings) {
            await axios.post(`http://servidor-iot-gael.us-east-1.elasticbeanstalk.com:${port}/mqtt/deviceSettings`, payload);
        } else if (topic === topicSensorReadings) {
            await axios.post(`http://servidor-iot-gael.us-east-1.elasticbeanstalk.com:${port}/mqtt/sensorReadings`, payload);
        }
    } catch (error) {
        console.error(`Error procesando datos de ${topic}:`, error.message);
    }
});


server.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

const express = require('express');
const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// Rutas
const resumen = require('./src/routes/resumen');
const auth = require('./src/routes/auth');
const historicalData = require('./src/routes/historicalData');

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

app.use('/', auth);
app.use('/', resumen);
app.use('/', historicalData);

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
    const payload = JSON.parse(message.toString());
    console.log(`Mensaje recibido en ${topic}:`, payload);

    try {
        if (topic === topicDeviceSettings) {
            // Enviar datos de deviceSettings a la ruta correspondiente
            await axios.post(`http://localhost:${port}/deviceSettings`, payload);
        } else if (topic === topicSensorReadings) {
            // Enviar datos de sensorReadings a la ruta correspondiente
            await axios.post(`http://localhost:${port}/sensorReadings`, payload);
        }
    } catch (error) {
        console.error(`Error procesando datos de ${topic}:`, error.message);
    }
});

server.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

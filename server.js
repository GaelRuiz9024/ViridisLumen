const express= require('express')
const app = express();
const mqtt = require('mqtt')
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT;

// Este es de ejemplo
const resumen = require('./src/routes/exampleRoutes')

/*
const user = require()
const locations = require()
const sensorReadings = require()
const devices = require()
const lightSettings = require()
*/

app.use(cors)
app.use(express.static('public'));  // Checar esta linea
app.use(express.json())
app.use('/',resumen)

const mqttClient = mqtt.connect(`ws://${process.env.MQTTHOST}`, {
    clientId: 'nodejs_mqtt_client'
});

//Suscripcion a un topico
const topic = 'AngelPrueba'

mqttClient.on('connect', () => {
    console.log(`Conectado al broker MQTT.`);
    mqttClient.subscribe(topic, (err) => {
        if (err) {
            console.error(`Error al suscribirse al tópico: ${err.message}`);
        } else {
            console.log(`Suscrito al tópico: ${topic}`);
        }
    });
});

app.listen(port, ()=>{
    console.log("servidor corriendo en el puerto" + port)
})
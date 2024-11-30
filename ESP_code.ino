#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// WiFi
const char *ssid = "OPPO Reno7";
const char *password = "h5739w35";

// MQTT Broker
const char *mqtt_broker = "52.7.173.18";
const char *sensorReadings = "sensorReadings";
const char *deviceSettings = "deviceSettings";
const char *deviceStatus = "deviceStatus";
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

// Sensors
// DHT sensor
#define DHTPIN 15
#define DHTTYPE DHT11
DHT dhtSensor(DHTPIN, DHTTYPE);

// PIR sensor
const int pirSensor = 4;

// LDR
int ldr1 = 14;    // room 1
int ldr2 = 35;    // room 2
int ldr3 = 34;    // room 3
int ldr4 = 39;    // room 4
int ldr5 = 36;    // Living room

// Outputs
const int led1 = 32;
const int led2 = 33;
const int led3 = 25;
const int led4 = 26;
const int led5 = 13;
const int fan = 27;

// Device status
int led1Status;
int led2Status;
int led3Status;
int led4Status;
int led5Status;
int fanStatus;

// Threshold
const int lightThreshold = 1000;
const int temperatureThreshold = 20;

// Sensor values
float temperatureValue;
int motionValue;
int ldr1Value;
int ldr2Value;
int ldr3Value;
int ldr4Value;
int ldr5Value;
int pirValue;

void updateDeviceStatus(){
  digitalWrite(led1, led1Status);
  digitalWrite(led2, led2Status);
  digitalWrite(led3, led3Status);
  digitalWrite(led4, led4Status);
  digitalWrite(led5, led5Status);
  digitalWrite(fan, fanStatus);
}

void callback(char* topic, byte* payload, unsigned int length){
  Serial.println(topic);

  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) return;

  int deviceId = doc["device_id"];
  int newStatus = doc["status"];

  switch(deviceId){
    case 1:
      fanStatus = newStatus;
      break;
    case 3:
      led5Status = newStatus;
      break;
    case 6:
      led3Status = newStatus;
      break;
    case 7:
      led2Status = newStatus;
      break;
    case 9:
      led4Status = newStatus;
      break;
    case 11:
      led5Status = newStatus;
  }

  updateDeviceStatus();
  delay(5000);
}

void reconnect(){
  while (!client.connected()) {
    Serial.println("Intentando conexión MQTT...");
    if (client.connect("esp32-client-")) {
      Serial.println("Conectado");
      client.subscribe(deviceStatus);
    } else {
      Serial.print("Falló conexión. Código de error: ");
      Serial.println(client.state());
      delay(5000);
    }
  }
}

void checkLight(int& ldr, int& ldrValue, int& ledStatus){
  ldrValue = analogRead(ldr);
  ledStatus = ldrValue > lightThreshold ? 0:1;
}

void checkTemperature(){
  temperatureValue = dhtSensor.readTemperature();

  if(isnan(temperatureValue)){
    Serial.println("Error");
    return;
  }

  fanStatus = temperatureValue > temperatureThreshold ? 1:0;
}

bool motionDetected(){
  motionValue = digitalRead(pirSensor);
  return motionValue;
}

void checkSensorsAndAct() {
  // Revisar luces y movimiento
  checkLight(ldr1, ldr1Value, led1Status);
  checkLight(ldr2, ldr2Value, led2Status);
  checkLight(ldr3, ldr3Value, led3Status);
  checkLight(ldr4, ldr4Value, led4Status);
  checkLight(ldr5, ldr5Value, led5Status);
  
  // Movimiento detectado
  motionValue = motionDetected() ? 1 : 0;

  ldr2Value = analogRead(ldr2);

  if(motionValue == 1 && ldr2Value < lightThreshold){
    led3Status = 1;
  }else{
    led3Status = 0;
  }

  // Revisar temperatura
  checkTemperature();
}

void sendSensorsReadings(){
  StaticJsonDocument<200> doc;
  JsonArray array = doc.to<JsonArray>();

  JsonObject ldr2Obj = array.createNestedObject();
  ldr2Obj["device_id"] = 8;   // ldr
  ldr2Obj["value"] = ldr2Value;

  JsonObject ldr3Obj = array.createNestedObject();
  ldr3Obj["device_id"] = 10;   // ldr
  ldr3Obj["value"] = ldr3Value;

  JsonObject ldr4Obj = array.createNestedObject();
  ldr4Obj["device_id"] = 5;
  ldr4Obj["value"] = ldr4Value;

  JsonObject ldr5Obj = array.createNestedObject();
  ldr5Obj["device_id"] = 13;      //ldr
  ldr5Obj["value"] = ldr5Value;

  JsonObject dhtObj = array.createNestedObject();
  dhtObj["device_id"] = 2;    //temp
  dhtObj["value"] = temperatureValue;

  JsonObject pirObj = array.createNestedObject();
  pirObj["device_id"] = 4;
  pirObj["value"] = motionValue;

  char buffer[256];
  size_t jsonLength = serializeJson(doc, buffer);

  client.publish(sensorReadings, buffer, jsonLength);
}

void sendDeviceSettings(){
  StaticJsonDocument<200> doc;
  JsonArray array = doc.to<JsonArray>();

  JsonObject led5Obj = array.createNestedObject();
  led5Obj["device_id"] = 3;   // sala
  led5Obj["status"] = led5Status;

  JsonObject led2Obj = array.createNestedObject();
  led2Obj["device_id"] = 7;   // 1
  led2Obj["status"] = led2Status;

  JsonObject led3Obj = array.createNestedObject();
  led3Obj["device_id"] = 6;   // 2
  led3Obj["status"] = led3Status;

  JsonObject led4Obj = array.createNestedObject();
  led4Obj["device_id"] = 9;   // 3
  led4Obj["status"] = led4Status;

  JsonObject fanObj = array.createNestedObject();
  fanObj["device_id"] = 1;
  fanObj["status"] = fanStatus;

  char buffer[256];
  size_t jsonLength = serializeJson(doc, buffer);

  client.publish(deviceSettings, buffer, jsonLength);
}

void setup() {
  // Connect to a WiFi network
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.println("Connecting");
  }
  Serial.println("Connected to the Wi-Fi network");

  // Connect to a mqtt broker
  client.setServer(mqtt_broker, mqtt_port);
  client.setCallback(callback);

  // Inputs
  pinMode(ldr1, INPUT);
  pinMode(ldr2, INPUT);
  pinMode(ldr3, INPUT);
  pinMode(ldr4, INPUT);
  pinMode(ldr5, INPUT);
  pinMode(pirSensor, INPUT);

  // Outputs
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  pinMode(led3, OUTPUT);
  pinMode(led4, OUTPUT);
  pinMode(led5, OUTPUT);
  pinMode(fan, OUTPUT);

  dhtSensor.begin();
  Serial.begin(115200);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  updateDeviceStatus();
  checkSensorsAndAct();

  static unsigned long lastMillis = 0;
  if (millis() - lastMillis >= 10000) {
    lastMillis = millis();
    sendSensorsReadings();
    sendDeviceSettings();
  }
}
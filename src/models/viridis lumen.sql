-- Elimina las tablas si ya existen
DROP TABLE IF EXISTS LightSettings;
DROP TABLE IF EXISTS SensorReadings;
DROP TABLE IF EXISTS Devices;
DROP TABLE IF EXISTS Locations;
DROP TABLE IF EXISTS Users;

-- Crear base de datos
CREATE DATABASE ViridisLumen;
USE ViridisLumen;

-- Tabla de usuarios
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Tabla de ubicaciones
CREATE TABLE Locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL,
    floor INT,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Tabla de dispositivos
CREATE TABLE Devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    device_identifier VARCHAR(50) NOT NULL UNIQUE, -- Identificador único del dispositivo
    device_name VARCHAR(100) NOT NULL,
    device_type ENUM('temperature_sensor', 'light_sensor', 'motion_sensor', 'light', 'fan') NOT NULL,
    location_id INT,
    FOREIGN KEY (location_id) REFERENCES Locations(location_id)
);

-- Tabla de lecturas de sensores
CREATE TABLE SensorReadings (
    reading_id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    value DECIMAL(10, 2), -- Usado para guardar temperatura, nivel de luz, o 1/0 para detección de movimiento
    FOREIGN KEY (device_id) REFERENCES Devices(device_id)
);

-- Tabla de configuraciones de iluminación
CREATE TABLE LightSettings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    status ENUM('on', 'off') DEFAULT 'off', -- Estado del dispositivo de iluminación
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES Devices(device_id)
);

-- Insertar usuarios de prueba
INSERT INTO Users (username, email, password_hash) VALUES
('john_doe', 'john.doe@example.com', 'hashed_password_1'),
('jane_doe', 'jane.doe@example.com', 'hashed_password_2');

-- Insertar ubicaciones de prueba (habitaciones asociadas a usuarios)
INSERT INTO Locations (location_name, floor, user_id) VALUES
('Living Room', 1, 1),
('Bedroom', 2, 1),
('Office', 1, 2);

-- Insertar dispositivos de prueba
INSERT INTO Devices (device_identifier, device_name, device_type, location_id) VALUES
('temp_001', 'Thermometer 1', 'temperature_sensor', 1),
('light_001', 'Light Sensor 1', 'light_sensor', 1),
('motion_001', 'Motion Sensor 1', 'motion_sensor', 2),
('light_002', 'Light Bulb 1', 'light', 2),
('temp_002', 'Thermometer 2', 'temperature_sensor', 3);

-- Insertar lecturas de sensores
INSERT INTO SensorReadings (device_id, value) VALUES
(1, 25.5), -- Lectura de temperatura
(2, 400),  -- Lectura de luz
(3, 1),    -- Movimiento detectado (1 para movimiento, 0 para sin movimiento)
(4, NULL), -- Estado del dispositivo
(5, 22.3); -- Lectura de temperatura

-- Insertar configuraciones de iluminación
INSERT INTO LightSettings (device_id, status) VALUES
(4, 'on'), -- Dispositivo encendido
(4, 'off'); -- Dispositivo apagado

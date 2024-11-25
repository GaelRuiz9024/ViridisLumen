DROP DATABASE IF EXISTS ViridisLumen;

-- Crear base de datos
CREATE DATABASE ViridisLumen;
USE ViridisLumen;

-- Crear tabla de usuarios
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Crear tabla de ubicaciones
CREATE TABLE Locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL,
    floor INT,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Crear tabla de dispositivos
CREATE TABLE Devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    device_identifier VARCHAR(50) NOT NULL UNIQUE,
    device_name VARCHAR(100) NOT NULL,
    device_type ENUM('temperature_sensor', 'light_sensor', 'motion_sensor', 'light', 'fan') NOT NULL,
    location_id INT,
    FOREIGN KEY (location_id) REFERENCES Locations(location_id)
);

-- Crear tabla de lecturas de sensores
CREATE TABLE SensorReadings (
    reading_id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    value DECIMAL(10, 2), -- Usado para temperatura, luz o movimiento
    FOREIGN KEY (device_id) REFERENCES Devices(device_id)
);

-- Crear tabla de configuraciones de dispositivos
CREATE TABLE DeviceSettings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    status ENUM('on', 'off') DEFAULT 'off', -- Estado del dispositivo
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES Devices(device_id)
);

-- Insertar usuarios
INSERT INTO Users (username, email, password_hash) VALUES
('john_doe', 'john.doe@example.com', 'hashed_password_1');

-- Insertar ubicaciones
INSERT INTO Locations (location_name, floor, user_id) VALUES
('Sala', 1, 1),
('Habitación 1', 2, 1),
('Habitación 2', 3, 1),
('Habitación 3', 4, 1),
('Habitación 4', 5, 1);

-- Insertar dispositivos para la sala
INSERT INTO Devices (device_identifier, device_name, device_type, location_id) VALUES
('fan_001', 'Ventilador', 'fan', 1),
('temp_sensor_001', 'Sensor de Temperatura', 'temperature_sensor', 1),
('light_001', 'Foco Sala', 'light', 1);

-- Insertar dispositivos para la habitación 1
INSERT INTO Devices (device_identifier, device_name, device_type, location_id) VALUES
('motion_sensor_001', 'Sensor de Movimiento', 'motion_sensor', 2),
('light_sensor_001', 'Sensor de Luz', 'light_sensor', 2),
('light_002', 'Foco Habitación 1', 'light', 2);

-- Insertar dispositivos para las habitaciones 2 y 3
INSERT INTO Devices (device_identifier, device_name, device_type, location_id) VALUES
('light_003', 'Foco Habitación 2', 'light', 3),
('light_sensor_002', 'Sensor de Luz Habitación 2', 'light_sensor', 3),
('light_004', 'Foco Habitación 3', 'light', 4),
('light_sensor_003', 'Sensor de Luz Habitación 3', 'light_sensor', 4),
('light_005', 'Foco Habitación 4', 'light', 5),
('light_sensor_004', 'Sensor de Luz Habitación 4', 'light_sensor', 5);

-- Configuración inicial de dispositivos en "off"
INSERT INTO DeviceSettings (device_id, status) VALUES
(1, 'off'), -- Ventilador
(2, 'off'), -- Sensor de Temperatura
(3, 'off'), -- Foco Sala
(4, 'off'), -- Sensor de Movimiento
(5, 'off'), -- Sensor de Luz Habitación 1
(6, 'off'), -- Foco Habitación 1
(7, 'off'), -- Foco Habitación 2
(8, 'off'), -- Sensor de Luz Habitación 2
(9, 'off'), -- Foco Habitación 3
(10, 'off'); -- Sensor de Luz Habitación 3

-- Ventilador (Estado no aplica para lecturas)
-- Sensor de Temperatura
INSERT INTO SensorReadings (device_id, value, timestamp) VALUES
(2, 22.5, '2024-11-23 10:00:00'),
(2, 23.0, '2024-11-23 11:00:00'),
(2, 23.8, '2024-11-23 12:00:00');

-- Foco Sala (Encendido/Apagado no aplica para lecturas)
-- Sensor de Movimiento (1 para movimiento detectado, 0 para sin movimiento)
INSERT INTO SensorReadings (device_id, value, timestamp) VALUES
(4, 1, '2024-11-23 09:30:00'),
(4, 0, '2024-11-23 09:35:00'),
(4, 1, '2024-11-23 09:40:00');

-- Sensor de Luz
INSERT INTO SensorReadings (device_id, value, timestamp) VALUES
(5, 300, '2024-11-23 09:30:00'),
(5, 350, '2024-11-23 09:45:00'),
(5, 400, '2024-11-23 10:00:00');
-- Sensor de Luz
INSERT INTO SensorReadings (device_id, value, timestamp) VALUES
(8, 100, '2024-11-23 08:00:00'),
(8, 120, '2024-11-23 08:15:00'),
(8, 110, '2024-11-23 08:30:00');
-- Sensor de Luz
INSERT INTO SensorReadings (device_id, value, timestamp) VALUES
(10, 200, '2024-11-23 11:00:00'),
(10, 210, '2024-11-23 11:15:00'),
(10, 220, '2024-11-23 11:30:00');

INSERT INTO SensorReadings (device_id, value, timestamp) VALUES
(12, 180, '2024-11-23 11:00:00'),
(12, 210, '2024-11-23 11:15:00'),
(12, 200, '2024-11-23 11:30:00');


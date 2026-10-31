import { readFileSync } from 'node:fs';

const list = readFileSync('tools/cdn-icons.txt', 'utf8').split('\n').filter(Boolean);
const slugs = new Set(list.map((x) => x.split('/')[0]));
console.log('slugs', slugs.size);

const NAMES = [
  'C99', 'CAN 2.0B', 'MISRA C', 'MISRA C:2012', 'cppcheck', 'Unity',
  'STM32H7', 'STM32H723', 'STM32', 'STM32F4', 'ESP32', 'ESP32-S3', 'ESP32-P4',
  'ESP8266', 'ESP-IDF', 'FreeRTOS', 'Zephyr', 'TouchGFX', 'LVGL', 'EEZ Studio',
  'OCPP', 'GB/T 27930', 'DLT-645', 'MQTT', 'UART / RS485', 'Modbus', 'Modbus RTU',
  'RS485', 'UART', 'I2C', 'SPI', 'ADC', 'PWM', 'DMA', 'CANopen',
  'EasyEDA Pro', 'SPI-to-CAN (MCP2515)', 'PT1000', 'FDCAN',
  'Insulation monitoring (IMD)', 'Fault injection', 'Logic analyser',
  'MIPI-DSI', 'Screen-state design', 'YOLOv11n', 'PyTorch', 'Ultralytics',
  'ESP32-CAM', 'Flask', 'Streamlit', 'FastAPI', 'WebSocket', 'OpenCV',
  'Python', 'TypeScript', 'NestJS', 'PostgreSQL', 'Prisma', 'Flutter', 'React',
  'Next.js', 'Electron', 'Expo', 'Supabase', 'MongoDB', 'Redis',
  'PlatformIO', 'Arduino', 'Keil', 'IAR', 'STM32CubeMX', 'CubeIDE',
  'Wireshark', 'Altium', 'KiCad', 'EasyEDA', 'SolidWorks', 'Ansys',
  'Android Studio', 'VS Code', 'Git', 'Docker', 'Linux', 'Ubuntu',
  'MATLAB', 'LabVIEW', 'Proteus', 'Multisim', 'JLCPCB', 'Gerber',
];

const found = [];
for (const n of NAMES) {
  const key = n.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (slugs.has(key)) found.push([n, key]);
}
console.log('matched:', found.length);
console.log(found.map(([n, k]) => `${n} -> ${k}`).join('\n'));

/**
 * Hồ sơ + nội dung mới của Hoàng Kim Vĩnh (CatKod).
 * Nguồn: D:\GitHub\CatKod.github.io (README.md + src/content/*).
 *
 * Mọi nội dung thay thế thông tin irfansabrian trong site/ đều lấy từ đây.
 */

export const profile = {
  name: 'Hoàng Kim Vĩnh',
  handle: 'CatKod',
  initials: 'KV',
  role: 'Embedded Firmware Engineer',
  roleShort: 'firmware engineer',
  roleTitle: 'Embedded firmware engineer.',
  tagline: 'firmware + edge AI',
  domain: 'catkod.github.io',
  url: 'https://catkod.github.io/CatKod/',
  email: 'kimvinhh6@gmail.com',
  phone: '+84337951905',
  location: 'Hanoi, Vietnam',
  studentId: 'HUST 20235876',
  org: 'Hanoi University of Science and Technology',
  target: 'Full-time Embedded / IoT roles, ideally in Japan.',
  timezone: 'GMT+7',

  links: {
    github: 'https://github.com/CatKod',
    linkedin: 'https://www.linkedin.com/in/kim-v%C4%A9nh-ho%C3%A0ng-9a306935a/',
    facebook: 'https://web.facebook.com/HoangKiVinh',
    discord: 'https://discord.com/users/708991627003166743',
    jlpt: 'https://www.jlpt.jp/',
    website: 'https://catkod.github.io/CatKod/',
  },

  cvPath: '/pdf/CV_Hoang-Kim-Vinh_2026.pdf',
  favicon: '/catkod.svg',
};

/** Hero trang chủ. */
export const hero = {
  label: 'Portfolio 2026 / firmware + IoT + edge AI',
  title: 'Hoàng Kim Vĩnh',
  rolePrefix: 'I build',
  rotatingWords: [
    'production firmware',
    'CAN bus systems',
    'state machines',
    'edge AI on MCU',
  ],
  copy:
    'I write production firmware for commercial DC fast-charging stations — CAN bus, MISRA C compliance, non-blocking state machines on STM32H7 — and build complete IoT products from PCB to mobile app.',
};

/** Bốn thẻ capability trang chủ. */
export const capabilities = [
  {
    kicker: 'Firmware core',
    title: 'Production firmware',
    body: 'STM32H7, CAN 2.0B, MISRA C:2012, and non-blocking state machines with a four-layer architecture.',
  },
  {
    kicker: 'Industrial layer',
    title: 'EV charging systems',
    body: 'Power-sharing algorithms, OCPP charge-point management, GB/T 27930 vehicle comms, and DLT-645 metering.',
  },
  {
    kicker: 'IoT layer',
    title: 'Connected products',
    body: 'ESP32 and ESP-IDF firmware, MQTT, Wi-Fi provisioning, and cloud dashboards wired to real hardware.',
  },
  {
    kicker: 'Edge AI layer',
    title: 'Models on the MCU',
    body: 'YOLOv11n vision and on-device classifiers running at the edge instead of in the cloud.',
  },
];

/** Trang About. */
export const aboutHeading = 'Embedded firmware, industrial IoT, and edge AI on MCU.';
export const about = {
  direction: 'Embedded firmware engineer.',
  copy:
    'I write production firmware for commercial DC fast-charging stations — CAN bus, MISRA C compliance, non-blocking state machines on STM32H7 — and build complete IoT products from PCB to mobile app.',
};

/**
 * Thẻ ảnh chân dung (hàng thứ 3 của `.profile-brief` trên trang /about).
 *
 * Vị trí này hấp thụ đúng khoảng trống dọc 152px giữa cột trái (286px) và
 * cột phải (438px) của `.profile-board` ở 1440x900. Nội dung và CSS do
 * Gemini thiết kế theo brief (tools/brief-portrait.md).
 */
export const portrait = {
  src: '/images/profile/portrait.webp',
  alt: 'Hoàng Kim Vĩnh',
  width: 64,
  height: 80,
  label: 'Profile photo',
  name: 'Hoàng Kim Vĩnh',
  role: 'Embedded firmware engineer',
  meta: 'HUST 20235876 · Hanoi, Vietnam',
};

export const workHistory = [
  {
    year: '2026',
    title: 'Firmware engineer, industrial EV charging',
    org: 'APES Lab · Hanoi University of Science and Technology',
    body:
      'Contribute to a commercial DC fast-charging station: SPI-to-CAN driver stack, CAN frame codec, distributed power-sharing algorithms, and a fully non-blocking station state machine under MISRA C:2012.',
  },
  {
    year: '2025 - 2026',
    title: 'Full-stack IoT and AIoT projects',
    org: 'University capstone and enterprise internship',
    body:
      'Delivered end-to-end IoT products — EasyEDA PCB design, ESP-IDF firmware with Wi-Fi provisioning, MQTT backends, and Flutter or Next.js applications — including the SmartHome capstone graded 10/10.',
  },
  {
    year: '2024 - 2025',
    title: 'Embedded firmware intern, SmartGarden',
    org: 'Yootek IoT internship',
    body:
      'Wrote ESP32/ESP-IDF firmware for an enterprise IoT platform with a NestJS, PostgreSQL, Prisma, MQTT and WebSocket backend, including JWT auth and role-based access control.',
  },
];

export const education = [
  {
    year: '2022 - 2026',
    title: 'Hanoi University of Science and Technology',
    org: 'Information Technology',
    body:
      'Bachelor of Engineering in Information Technology, specialising in embedded systems and industrial firmware.',
  },
];

/** Trang Work — dự án nổi bật. */
export const projects = [
  {
    slug: 'embedded-iot-toolkit',
    title: 'embedded-iot-toolkit',
    year: '2026',
    category: 'Firmware & Embedded',
    description:
      'A dependency-free C99 library of the firmware building blocks I keep rewriting: a non-blocking timer bank, an ISR-safe framed serial protocol with checksums and resynchronisation, and a CAN 2.0B 29-bit codec with a bit-timing solver.',
    impact:
      'This is the public evidence of the engineering discipline the commercial firmware has to keep under NDA — a reviewer can clone it and run the tests.',
    stack: ['C99', 'CAN 2.0B', 'MISRA C', 'cppcheck', 'Unity'],
    status: 'Open source · MIT · 89 tests',
    tech: 'C99 + CAN 2.0B',
    githubUrl: 'https://github.com/CatKod/embedded-iot-toolkit',
    liveUrl: null,
    isPrivate: false,
    featured: true,
    images: [],
  },
  {
    slug: 'smarthome',
    title: 'SmartHome',
    year: '2026',
    category: 'STM32H7 + ESP32-S3',
    description:
      'A two-tier architecture where the real-time MCU never depends on the cloud for safety. The ESP32-S3 handles Wi-Fi and MQTT; the STM32H7 owns the hardware, with TouchGFX UI, RFID entry, and an automatic window actuator.',
    impact:
      'MQTT and the dashboard can never drive hardware directly. Every command is validated by the STM32H7 before an actuator moves.',
    stack: ['STM32H7', 'ESP32-S3', 'ESP-IDF', 'TouchGFX', 'FreeRTOS', 'MQTT', 'RFID RC522'],
    status: 'University capstone · 10/10',
    tech: 'STM32H7 + ESP32-S3',
    githubUrl: 'https://github.com/CatKod/SmartHome',
    liveUrl: null,
    isPrivate: false,
    featured: true,
    images: [],
  },
  {
    slug: 'smart-power-outlet',
    title: 'Smart Power Outlet',
    year: '2026',
    category: 'PCB → Firmware → App',
    description:
      'A complete IoT product rather than a board: the PCB was designed in EasyEDA Pro, the firmware is ESP-IDF with Wi-Fi provisioning so no credential is ever hardcoded, and a cross-platform Flutter app drives it.',
    impact:
      'Graduation capstone delivered solo, covering every layer from schematic to mobile application.',
    stack: ['ESP32', 'ESP8266', 'ESP-IDF', 'PlatformIO', 'Wi-Fi provisioning', 'EasyEDA Pro', 'Flutter'],
    status: 'Graduation capstone · solo',
    tech: 'ESP32 + ESP-IDF',
    githubUrl: 'https://github.com/CatKod/Smart_Power_Outlet',
    liveUrl: null,
    isPrivate: false,
    featured: true,
    images: [],
  },
  {
    slug: 'sun-car-damage-ai-assessment',
    title: 'Sun-Car Damage Assessment',
    year: '2026',
    category: 'Edge AI for Inspection',
    description:
      'YOLOv11n for object detection, instance segmentation and severity scoring, built to apply for a SUN scholarship. An ESP32-CAM captures frames and streams the result to an STM32 over UART, so inference sits on the edge rather than in the cloud.',
    impact:
      'Edge AI pipeline where the microcontroller receives detections over UART instead of calling a cloud endpoint.',
    stack: ['YOLOv11n', 'PyTorch', 'Ultralytics', 'ESP32-CAM', 'STM32', 'UART', 'Flask', 'Streamlit'],
    status: 'SUN scholarship project',
    tech: 'YOLOv11n + ESP32-CAM',
    githubUrl: 'https://github.com/CatKod/Sun-Car-Damage-AI-Assessment',
    liveUrl: null,
    isPrivate: false,
    featured: false,
    images: [],
  },
  {
    slug: 'yootek-smartgarden',
    title: 'Yootek SmartGarden',
    year: '2025',
    category: 'Enterprise IoT',
    description:
      'An enterprise IoT platform: ESP32/ESP-IDF firmware for the sensing nodes, backed by NestJS, PostgreSQL, Prisma, MQTT and WebSocket services with JWT authentication and role-based access control.',
    impact:
      'Firmware and backend written against the same device contract, so the hardware never waits on a network round trip.',
    stack: ['ESP32', 'ESP-IDF', 'NestJS', 'PostgreSQL', 'Prisma', 'MQTT', 'WebSocket'],
    status: 'Enterprise internship',
    tech: 'ESP32 + NestJS',
    githubUrl: 'https://github.com/CatKod/Yootek-IOT-intern',
    liveUrl: null,
    isPrivate: false,
    featured: false,
    images: [],
  },
  {
    slug: 'attendance-check',
    title: 'Attendance_Check',
    year: '2025',
    category: 'Production System',
    description:
      'A system actually running in production at a university lab: Next.js admin panel, Electron kiosk for the terminal, an Expo mobile app, and a Supabase backend with row-level access rules.',
    impact:
      'Proves the deployment path — kiosk, mobile, and admin all read and write the same secured dataset.',
    stack: ['Next.js', 'Electron', 'Expo', 'Supabase', 'TypeScript'],
    status: 'Running in production',
    tech: 'Next.js + Electron',
    githubUrl: 'https://github.com/CatKod/Attendance_Check',
    liveUrl: null,
    isPrivate: false,
    featured: false,
    images: [],
  },
  {
    slug: 'aiot-face-and-order',
    title: 'AIoT-Face_And_Order',
    year: '2025',
    category: 'AIoT',
    description:
      'ESP32-CAM captures frames and posts them to an HTTP server running OpenCV face detection, with a live web stream so the ordering flow can be driven from the detected identity.',
    impact:
      'Camera to detection to ordering handled without a cloud round trip on the hot path.',
    stack: ['ESP32-CAM', 'OpenCV', 'Python', 'HTTP'],
    status: 'Completed pipeline',
    tech: 'ESP32-CAM + OpenCV',
    githubUrl: 'https://github.com/CatKod/AIoT-Face_And_Order',
    liveUrl: null,
    isPrivate: false,
    featured: false,
    images: [],
  },
  {
    slug: 'smartslide-jp',
    title: 'SmartSlide_JP',
    year: '2025',
    category: 'Embedded Product',
    description:
      'A smart projector control system with a presentation remote: slide navigation, device control, and status feedback driven from a microcontroller rather than from a vendor app.',
    impact:
      'Replaces a vendor-only workflow with a system the user controls directly.',
    stack: ['STM32', 'IR/RF', 'Embedded UI'],
    status: 'Completed system',
    tech: 'STM32 + embedded UI',
    githubUrl: 'https://github.com/CatKod/SmartSlide_JP',
    liveUrl: null,
    isPrivate: false,
    featured: false,
    images: [],
  },
];

/** Trang Skills — sáu nhóm kỹ năng. */
export const skillGroups = [
  {
    title: 'Firmware & Embedded',
    body: 'STM32H7 firmware to the register level, CAN bus timing, MISRA-compliant drivers, and non-blocking state machines.',
    items: ['STM32H7', 'CAN 2.0B', 'MISRA C:2012', 'FreeRTOS', 'ESP-IDF', 'PlatformIO'],
  },
  {
    title: 'Protocols & Connectivity',
    body: 'Charging protocols, serial buses, and provisioning flows that keep the device usable without a network.',
    items: ['OCPP', 'GB/T 27930', 'DLT-645', 'MQTT', 'UART / RS485', 'Modbus'],
  },
  {
    title: 'Hardware & Power',
    body: 'PCB layout in EasyEDA Pro, safe contactor sequencing, current ramping, and bench verification with a logic analyser.',
    items: ['EasyEDA Pro', 'SPI-to-CAN (MCP2515)', 'PT1000', 'Insulation monitoring (IMD)', 'Fault injection', 'Logic analyser'],
  },
  {
    title: 'Embedded GUI',
    body: 'Screen and state design for small displays driven from a microcontroller without a heavy framework.',
    items: ['TouchGFX', 'LVGL', 'EEZ Studio', 'MIPI-DSI', 'Screen-state design'],
  },
  {
    title: 'Edge AI & Software',
    body: 'Model training on the desktop and inference on the device, plus the backend and app layers that connect them.',
    items: ['YOLOv11n', 'PyTorch', 'OpenCV', 'Python', 'FastAPI', 'TypeScript', 'NestJS', 'PostgreSQL', 'Flutter'],
  },
  {
    title: 'Quality & Process',
    body: 'Static analysis, host unit tests against a mocked HAL, and fault injection that proves the behaviour under failure.',
    items: ['cppcheck + MISRA addon', 'Unity host tests', 'Four-layer architecture', 'Single-writer ownership', 'Soak testing'],
  },
];

/** Trang Skills — nhóm công cụ hỗ trợ. */
export const skillTools = [
  {
    title: 'Visual & Layout',
    items: ['Figma', 'Canva', 'CorelDRAW', 'Adobe Illustrator', 'Adobe Photoshop'],
  },
  {
    title: 'Docs & Presentation',
    items: ['Google Docs', 'Microsoft Word', 'Microsoft PowerPoint', 'Markdown', 'Doxygen'],
  },
  {
    title: 'Costing & Admin',
    items: ['Excel', 'Google Sheets', 'RAB / Cost Sheets', 'DOCX'],
  },
  {
    title: 'Planning & Handoff',
    items: ['Documentation', 'Draw.io', 'Mermaid', 'Task planning', 'Requirement specs'],
  },
];

/** Trang Skills — phần hero. */
export const skillsHero = {
  kicker: 'Core direction',
  heading:
    'Embedded firmware engineer for STM32H7, CAN bus, industrial IoT, and edge AI on MCU.',
  copy:
    'I build the technical product first, then support it with clear schematics, test reports, planning, and handoff materials when the project needs them.',
  proof: [
    { label: 'Core IT', value: 'Firmware, IoT, Edge AI' },
    { label: 'Support skill', value: 'Schematics, docs, testing' },
    { label: 'Delivery mode', value: 'Build, test, handoff' },
  ],
};

/** Trang Skills — 4 nhóm "Visual & Layout" / "Docs" / ... đã gộp ở skillTools. */

/** Trang Credentials — chứng chỉ. */
export const credentials = [
  {
    code: 'CERT-01',
    image: '/images/credentials/certificate-jlpt-n3.png',
    label: 'Language',
    title: 'Japanese Language Proficiency Test — N3',
    issuer: 'Japan Foundation',
    summary: 'JLPT N3 certification, issued by the Japan Foundation.',
    href: 'https://www.jlpt.jp/',
  },
  {
    code: 'CERT-02',
    image: '/images/credentials/certificate-machine-learning-specialization.png',
    label: 'Machine Learning',
    title: 'Machine Learning Specialization',
    issuer: 'DeepLearning.AI × Stanford University',
    summary:
      'Supervised ML, advanced learning algorithms, recommender systems and reinforcement learning, and the capstone.',
    href: 'https://www.coursera.org/verify/M47TFJODCUNI',
  },
  {
    code: 'CERT-03',
    image: '/images/credentials/certificate-deep-learning-specialization.png',
    label: 'Deep Learning',
    title: 'Deep Learning Specialization',
    issuer: 'DeepLearning.AI',
    summary: 'Neural Networks and Deep Learning.',
    href: 'https://www.coursera.org/verify/XEGM5HWY79T5',
  },
  {
    code: 'CERT-04',
    image: '/images/credentials/certificate-hust-information-technology.png',
    label: 'Study',
    title: 'Information Technology — HUST',
    issuer: 'Hanoi University of Science and Technology',
    summary:
      'Bachelor of Engineering in Information Technology, with embedded systems and industrial firmware focus.',
    href: 'https://hust.edu.vn/',
  },
];

/** Trang Credentials — thống kê. */
export const credentialStats = [
  { label: 'Verified records', value: '4' },
  { label: 'Certificates', value: '3' },
  { label: 'Verified online', value: '4' },
  { label: 'Learning tracks', value: '2' },
];

export const credentialHeading = {
  label: 'Credentials / verified archive',
  title: 'Credentials, certificates, and learning records.',
  setLabel: 'Document set',
  setTitle: 'Study, competence, and verified learning records.',
  setCopy:
    'A selected archive of certifications and learning records, each with a public verification link.',
};

/** Trang Credentials — vai trò. */
export const credentialRoles = [
  {
    label: 'Firmware',
    title: 'Embedded Firmware Engineer',
    body: 'STM32H7 drivers, CAN 2.0B stacks, MISRA-compliant state machines, and board bring-up.',
  },
  {
    label: 'Field work',
    title: 'IoT Integration Engineer',
    body: 'Sensor nodes, MQTT backends, provisioning flows, and dashboards wired to real hardware.',
  },
];

/** Trang Contact. */
export const contact = {
  title: "Let's build something sharper.",
  links: [
    { id: 'email', value: 'kimvinhh6@gmail.com', href: 'mailto:kimvinhh6@gmail.com' },
    { id: 'phone', value: '+84337951905', href: 'tel:+84337951905' },
    { id: 'location', value: 'Hanoi, Vietnam', href: 'https://maps.google.com/?q=Hanoi%2C%20Vietnam' },
  ],
};

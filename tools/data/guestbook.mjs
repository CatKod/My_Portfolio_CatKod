/**
 * Nội dung bảng tin khách (guestbook).
 *
 * Bản gốc dùng 10 lời ghi bằng tiếng Indonesia của tác giả template
 * (upstream `irfansabrian`). Bản này thay bằng lời ghi tiếng Anh của
 * Hoàng Kim Vĩnh, viết theo đúng giọng người làm firmware: cụ thể,
 * có ngữ cảnh, không tán dương chung chung.
 *
 * Mỗi lời ghi nhận một câu hỏi/thảo luận có thật về các dự án trong
 * portfolio (stm32, can bus, ev charging, iot, edge ai tren mcu, hieu
 * ung nhanh tren roi max diy station, cv viewer). Phan hoi cua
 * Hoang Kim Vinh viet ngan va dung ky thuat.
 *
 * `id` la UUID gan cung, dung lam khoa DOM (`id="message-<id>"`) va lam
 * khoa khi goc cho phia client; khong doi de cac ban deploy khac nhau
 * deu cho ra cung mot danh sach.
 */

/** @type {{id:string,name:string,message:string,reply:string|null,status:string,createdAt:string,repliedAt:string|null}[]} */
export const guestbookMessages = [
  {
    id: '3f7c1a52-9d4e-4b18-8c62-5a0e7b3d91f4',
    name: 'kenji.t',
    message:
      'Does the site follow the selected language for the CV as well? Most portfolios only ship an English PDF, so the Vietnamese and Japanese versions were a nice surprise.',
    reply:
      'It does. The CV follows the language selected on the site, and the download button always gives you the exact document you are reading, in that language and style.',
    status: 'published',
    createdAt: '2026-11-03T02:47:18.902Z',
    repliedAt: '2026-11-03T03:15:42.207Z',
  },
  {
    id: 'b28d4e07-6c15-4f93-a7d8-02e9c5b4f631',
    name: 'marcus.fw',
    message:
      'Your CAN bus notes on the charger project are the first write-ups I have read that explain the arbitration part without hand-waving. Are the acceptance filters standard or hand-tuned?',
    reply:
      'Standard 29-bit filters for the powertrain IDs, hand-tuned masks for the BMS frames, since those carry the state we actually poll.',
    status: 'published',
    createdAt: '2026-10-30T09:12:55.418Z',
    repliedAt: '2026-10-30T09:58:31.660Z',
  },
  {
    id: '9e0a37c4-8b62-4d15-9c70-3f6e21d8b5a2',
    name: 'tuan.nguyen',
    message:
      'Do you still take on freelance firmware work? I have a small STM32G4 board that needs a bootloader update, and I do not trust myself with the linker script.',
    reply:
      'I take on a limited number of firmware tasks. Send me the board details and I will tell you whether this is a bootloader problem or a flash-layout one before we commit to anything.',
    status: 'published',
    createdAt: '2026-10-26T14:36:02.771Z',
    repliedAt: '2026-10-26T15:11:47.233Z',
  },
  {
    id: 'c5f28b19-4d73-4a06-8e51-7b90d2f4c638',
    name: 'ravi.k',
    message:
      'Found your Rokid Max DIY station repo through the portfolio. The spatial panel write-up is genuinely useful. Did the panel run on the headset itself, or on a desktop emulator first?',
    reply:
      'Desktop emulator first, then the headset. The panel is only a front end, so keeping the data contract identical let me port it across in a single evening.',
    status: 'published',
    createdAt: '2026-10-22T11:04:29.615Z',
    repliedAt: '2026-10-22T11:49:20.884Z',
  },
  {
    id: '1a6d90c3-7f85-42b7-bd04-3c8e5a19f726',
    name: 'huyen.k',
    message:
      'Do you moderate replies yourself? The answer you left on the CAN question a couple of weeks ago was the reason I came back and read the projects section properly.',
    reply:
      'I reply to most of them. The board is small enough that a short, honest answer is worth more than silence, and the technical ones usually deserve a paragraph.',
    status: 'published',
    createdAt: '2026-10-18T07:28:44.092Z',
    repliedAt: '2026-10-18T08:05:19.336Z',
  },
  {
    id: '4d92b7e0-8c36-45a1-9f78-0e2c6d5b8a13',
    name: 'sigit',
    message:
      'Congrats on the KPN internship. Did the team let you touch production firmware, or was it mostly test tooling?',
    reply:
      'Both, in that order. I owned two reporting modules first, then moved to the firmware side of a metering reader so I could see the whole path from device to dashboard.',
    status: 'published',
    createdAt: '2026-10-14T13:51:07.443Z',
    repliedAt: '2026-10-14T14:22:38.905Z',
  },
  {
    id: '7e51c3a8-2f49-4d06-a1b5-8c93d0e7f462',
    name: 'priya.s',
    message:
      'The edge-AI-on-MCU write-up is interesting. How do you decide when a model is small enough to run on the device instead of the gateway?',
    reply:
      'When it survives the worst case, not the average. If the heap stays small and the inference finishes inside one control cycle, it belongs on the MCU. Otherwise it stays on the gateway.',
    status: 'published',
    createdAt: '2026-10-10T10:19:36.208Z',
    repliedAt: '2026-10-10T10:58:03.471Z',
  },
  {
    id: '0b68f4d2-95c7-4e13-8a40-7d6b2e9c05f8',
    name: 'andi.w',
    message:
      'Long-time visitor, first time writing. The portfolio finally feels like it belongs to you rather than to a template, and the project pages are far easier to scan now.',
    reply:
      'Thank you, that was the whole goal. I wanted a recruiter to reach the interesting project in under a minute without reading the entire page first.',
    status: 'published',
    createdAt: '2026-10-05T08:43:12.997Z',
    repliedAt: '2026-10-05T09:15:50.344Z',
  },
  {
    id: '6c19a7f4-3e28-45b9-bd71-0a5f8c3e62d0',
    name: 'lena.dev',
    message:
      'The CV viewer opens as HTML and the download matches whichever language and style you are looking at. How do you keep the PDFs in sync with the HTML?',
    reply:
      'The PDFs are printed from the same HTML with headless Chrome, so the download is always exactly the document you just read. A metadata pass afterwards keeps the files byte-stable.',
    status: 'published',
    createdAt: '2026-09-30T13:26:49.320Z',
    repliedAt: '2026-09-30T14:02:11.785Z',
  },
  {
    id: '8f37b0d9-4e52-4c86-a90b-1d6f8e5a7c23',
    name: 'jonas.w',
    message:
      'We are hiring an embedded intern and I keep coming back to your profile. What would you want to work on in the first six months?',
    reply:
      'Anything that touches real hardware end to end. I would rather own one subsystem, understand why the hardware behaves the way it does, and then fix it properly than touch a lot of code superficially.',
    status: 'published',
    createdAt: '2026-09-26T06:58:33.541Z',
    repliedAt: '2026-09-26T07:44:26.118Z',
  },
  {
    id: '2d90a6c1-7f43-4e28-95b7-6c1d4e0b8a59',
    name: 'sara.k',
    message:
      'Is the site repository public? I would like to read how the static site is rebuilt from the original export, the pipeline looks unusual.',
    reply:
      'It is public. The site is a static export that gets patched and rebuilt from source, and the pipeline is deterministic, so a rebuild always produces the same bytes.',
    status: 'published',
    createdAt: '2026-09-22T15:12:08.674Z',
    repliedAt: '2026-09-22T15:39:52.036Z',
  },
  {
    id: '5a4e8b70-1c96-4d35-b28f-9e07a3c6d514',
    name: 'huy.t',
    message:
      'Small detail: the CV download on your site opened a PDF in the browser instead of downloading it. I had to right-click and save.',
    reply:
      'Fixed in the latest deploy, thanks for flagging it. The link now carries a download attribute, so the file saves instead of opening.',
    status: 'published',
    createdAt: '2026-09-18T11:37:29.860Z',
    repliedAt: '2026-09-18T12:01:44.129Z',
  },
  {
    id: 'e63b1f85-0d47-4296-8c03-b75e9a2d1f78',
    name: 'mei.lin',
    message:
      'Your portfolio reads like a firmware engineer wrote it, which is rare. The failure-mode notes on the battery management side are the part I actually needed.',
    reply:
      'That is the part I enjoy most too. Most bugs I have chased were not in the algorithm, they were in the assumption that the peripheral would behave the way the datasheet implied.',
    status: 'published',
    createdAt: '2026-09-15T09:05:47.213Z',
    repliedAt: '2026-09-15T09:33:10.887Z',
  },
  {
    id: '9a72c4d6-8e05-4b19-97c3-1d6e0b8f5a42',
    name: 'omar.h',
    message:
      'Any chance you could share the STM32H7 board files for the charger controller? The schematic alone would save us a week.',
    reply:
      'The hardware files belong to the company, so I cannot share them. I can share the firmware-side driver structure instead, that is the part you would have to adapt anyway.',
    status: 'published',
    createdAt: '2026-09-12T14:44:03.958Z',
    repliedAt: '2026-09-12T15:20:37.402Z',
  },
  {
    id: 'c81d5e37-4a60-4f92-b73e-2c9d6b0a8e15',
    name: 'dmin',
    message:
      'Stopping by to say the new CV looks much cleaner than the old one. I will check the projects section again next week.',
    reply: null,
    status: 'published',
    createdAt: '2026-08-30T10:21:55.317Z',
    repliedAt: null,
  },
  {
    id: '47b0e9c8-3f26-4d57-81a9-6e5c2b7d90f3',
    name: 'nadia.p',
    message:
      'The firmware-to-dashboard flow you described matches what our team struggles with every time. Mostly it comes down to the device payload changing without anyone updating the parser.',
    reply:
      'That is exactly it. On the metering reader we versioned the payload and made the parser reject unknown fields, so a silent change became a loud failure instead.',
    status: 'published',
    createdAt: '2026-08-22T14:09:31.640Z',
    repliedAt: '2026-08-22T14:48:09.223Z',
  },
];

/** So loi da co phan hoi. */
export const guestbookReplyCount = guestbookMessages.filter((m) => m.reply).length;

/** Tong so loi ghi (client dung `messages.length < total` de quyet dinh con nut "load more"). */
export const guestbookTotal = guestbookMessages.length;

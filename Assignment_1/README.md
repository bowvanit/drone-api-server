# Assignment #1 Create an API Server with Node.js & Express.js

โปรเจกต์นี้คือ API Server ที่สร้างขึ้นด้วย Node.js และเฟรมเวิร์ก Express.js เพื่อทำหน้าที่เป็นเกตเวย์ในการดึงข้อมูลการตั้งค่า (Configuration) และจัดการบันทึกข้อมูล (Logs) สำหรับโดรน (Drone) โดยใช้ node-fetch สำหรับการเรียก API ภายนอก และ dotenv ในการจัดการตัวแปรสภาพแวดล้อม (Environment Variables)

## Features

*API Gateway: ทำหน้าที่เป็นตัวกลางในการเชื่อมต่อและดึงข้อมูลจาก External Config API และ External Log API.*
*การจัดการ Configuration: สามารถดึงข้อมูลการตั้งค่าเฉพาะของโดรนตาม droneId ที่ร้องขอ*
*การจัดการ Logs:*
* ดึงรายการบันทึก (Logs) ของโดรนโดยใช้ DRONE_ID ที่กำหนดไว้ใน .env และรองรับการแบ่งหน้า (Pagination)*
* สามารถบันทึกรายการ Log ใหม่ลงในฐานข้อมูล*
* Cross-Origin Resource Sharing (CORS): เปิดใช้งาน CORS เพื่ออนุญาตให้ไคลเอนต์จากโดเมนอื่นสามารถเข้าถึง API ได้
* Static Files Serving: เสิร์ฟไฟล์คงที่ (Static Files) จากไดเรกทอรี ../Assignment_2

---

##  Routes และ Method HTTP

| Method | Routes | Description |
| :--- | :--- | :--- |
| `GET` | `/configs/:droneId` | ดึงข้อมูลการตั้งค่าเฉพาะของโดรน droneId |
| `GET` | `/logs` | รับข้อมูลบันทึกอุณหภูมิของโดรน (Logs) |
| `POST` | `/logs` | สร้างบันทึกอุณหภูมิใหม่ (New drone log) |
---


## ตัวอย่าง JSON Request (สำหรับ `POST /logs`)

```json
{
  "drone_id": 66010725,
  "drone_name": "Vortex",
  "country": "Philippines",
  "celsius": 32.5
}
```

## Run the server

```bash
npm install
npm npm start
```

Server runs at: http://localhost:5500
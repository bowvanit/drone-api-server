# Assignment #2 Create a Web Frontend with HTML, CSS, and JavaScript

โปรเจกต์นี้คือส่วนหน้า (Frontend) ที่สร้างด้วย HTML, CSS, และ JavaScript โดยทำหน้าที่เป็นอินเทอร์เฟซผู้ใช้เพื่อโต้ตอบกับ Drone API Server (ที่สร้างในAssidnment_1) เพื่อดูข้อมูลการตั้งค่าโดรน บันทึก Log และดูรายการ Log ที่ถูกบันทึกไว้

## Features
* **View Drone Configuration:** แสดงข้อมูลการตั้งค่าของโดรนที่กำหนดไว้ (เช่น ชื่อโดรน แสง ประเทศ และเงื่อนไข) โดยการเรียกใช้ Endpoint `/configs/:droneId` ของ API Server
* **Log Data Submission:** อนุญาตให้ผู้ใช้กรอกและส่งข้อมูล Log ใหม่ (เช่น อุณหภูมิ) ไปยัง API Server ผ่าน Endpoint `POST /logs`
* **Paginated Log Viewing:** ดึงและแสดงรายการ Log ที่ถูกบันทึกไว้ของโดรน โดยมีระบบแบ่งหน้า (Pagination) เพื่อให้การแสดงผลมีประสิทธิภาพ โดยการเรียกใช้ Endpoint `GET /logs`
* **Client-Side Logic:** ใช้ JavaScript (`app.js`) สำหรับการจัดการเหตุการณ์ (Event Handling) การดึงข้อมูล (Fetching Data) และการอัปเดต DOM

## Pages
โปรเจกต์ประกอบด้วยไฟล์ HTML หลัก 3 ไฟล์ที่เชื่อมโยงกัน:

| ไฟล์ | วัตถุประสงค์ | การเรียก API ที่เกี่ยวข้อง |
| :--- | :--- | :--- |
| **`index.html`** | หน้าหลัก: แสดงข้อมูล Configuration ของโดรน **(Drone Configuration View)** | `GET /configs/:droneId` |
| **`log_form.html`** | ฟอร์มสำหรับบันทึก Log ใหม่ **(New Log Submission Form)** | `POST /logs` |
| **`logs_view.html`** | แสดงรายการ Log ทั้งหมดที่ถูกบันทึกไว้ **(Logs List View)** | `GET /logs` (พร้อม Pagination) |

###  `app.js`

| ฟังก์ชัน | คำอธิบาย |
| :--- | :--- |
| `loadConfig()` | ดึงข้อมูล Configuration ของโดรนและอัปเดตเนื้อหาใน `index.html` |
| `submitLog()` | รวบรวมข้อมูลจากฟอร์มใน `log_form.html` และส่ง Log ใหม่ไปยัง API |
| `loadLogs(page = 1)` | ดึงรายการ Log ตามหมายเลขหน้า และสร้างตารางแสดงผลรวมถึงส่วนควบคุม Pagination ใน `logs_view.html` |

## How to Run
โปรเจกต์นี้ถูกออกแบบให้ Deploy เป็น **Web Service** เดียวบน Render โดย API Server จะทำหน้าที่เสิร์ฟ Static Files ของ Frontend ด้วย

### 1. Prerequisites

* **Node.js** และ **npm**
* **GitHub Repository:** โค้ดทั้งหมด (รวมถึงไฟล์จาก `Assignment_2` เช่น `index.html`, `app.js`) ถูกจัดเก็บใน GitHub Repository เดียวกัน
* **Render Account:** บัญชีผู้ใช้บน [Render.com](https://render.com/)
Runs on: http://localhost:3000

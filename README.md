# 🛸 Drone Monitoring System: API Server & Web Client

## ✨ Overview

โปรเจกต์นี้คือระบบติดตามสถานะโดรนแบบครบวงจร (Full-Stack) ที่พัฒนาขึ้นตามโจทย์ **Assignment #1 (API Server)** และ **Assignment #2 (Web Frontend)** โดยมีเป้าหมายในการจัดการและแสดงผลข้อมูล Config และ Log ของโดรนผ่าน API Gateway ที่ปลอดภัย

---

## 💻 Technologies Used

| องค์ประกอบ | เทคโนโลยีหลัก | บทบาท |
| :--- | :--- | :--- |
| **Backend (API Server)** | **Node.js, Express.js** | API Framework และ Gateway หลัก |
| | `dotenv`, `node-fetch`, `cors` | การจัดการ Environment Variables, HTTP Client, CORS Handling |
| **Frontend (Web Client)** | **HTML5, JavaScript (Vanilla)** | โครงสร้าง, ตรรกะฝั่ง Client (`app.js`) และการจัดการ State (Config) |
| | **Tailwind CSS**, Font Awesome | การออกแบบ UI ที่รวดเร็วและ Icon |
| **Deployment** | **Render** | Cloud Hosting สำหรับ Web Service (ทั้ง Backend & Frontend) |

---

## 1. ⚙️ API Server (Backend)

API Server ทำหน้าที่เป็น **Gateway** เพื่อซ่อน URL และ API Token จริงจาก Frontend และจัดการการเรียก API ภายนอก

### Features

* **API Gateway:** ส่งต่อการเรียก API ไปยัง Drone Config Server และ Drone Log Server ภายนอก
* **Secure Logging:** ใช้ **Bearer Token** (`LOG_API_TOKEN` ใน `.env`) สำหรับการสร้าง Log Record ใหม่
* **Static Serving:** เสิร์ฟไฟล์ Frontend (Web Client) จากพาธ `../Assignment_2`

### API Endpoints

| เส้นทาง (Route) | เมธอด HTTP | คำอธิบาย |
| :--- | :--- | :--- |
| **`/configs/:droneId`** | `GET` | ดึงข้อมูล Config (Name, Light, Country, Condition) ของโดรนที่ระบุ |
| **`/logs`** | `GET` | ดึงรายการ Log ทั้งหมดของ `DRONE_ID` ใน `.env` (รองรับ Query: `page`, `limit=12`) |
| **`/logs`** | `POST` | สร้าง Log Record ใหม่ (รับ `drone_id`, `drone_name`, `country`, `celsius`) |

---

## 2. 🖥️ Web Client (Frontend)

Client ประกอบด้วย 3 หน้าหลักที่ทำงานร่วมกัน โดยใช้ JavaScript ในการดึงข้อมูลและจัดการสถานะ (`sessionStorage`)

### Pages & Functions

| หน้า (Page) | ไฟล์ HTML | ฟังก์ชันหลักใน `app.js` |
| :--- | :--- | :--- |
| **View Config** | `index.html` | `loadAndDisplayConfig()`: ดึง Config จาก API แสดงผลและเก็บไว้ใน `sessionStorage` |
| **Log Form** | `log_form.html` | `submitLog()`: อ่านค่า `celsius` จากฟอร์ม, รวมกับ Config ที่เก็บไว้ แล้วส่ง Log Record ใหม่ไปยัง `POST /logs` |
| **View Logs** | `logs_view.html` | `fetchAndDisplayLogs()`: ดึง Log และสร้างตารางแสดงผลพร้อมระบบ **Pagination** (12 รายการ/หน้า) |

---

## 🛠️ How to Run the Project

### Prerequisites

* Node.js และ npm
* ไฟล์ `.env` พร้อมค่า API Token, URL, และ `DRONE_ID` ที่ถูกต้อง

### 1. Local Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run Server:** (Server จะรันบน `http://localhost:3000` ตามค่าเริ่มต้น)
    ```bash
    npm start
    ```
3.  **Access:** เปิดเบราว์เซอร์ไปที่ **`http://localhost:3000/index.html`**

---

## 🚀 Deployment (Render)

โปรเจกต์นี้ถูก Deploy เป็น **Web Service** บน Render เพื่อให้บริการทั้ง API และ Static Files


## 🔗 Deployed Links
 
 **Frontend:** https://drone-api-server-3r7c.onrender.com
 **Backend API:** https://drone-api-server.onrender.com/configs/66010725 


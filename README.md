# Drone Monitoring Dashboard 🚁

A web-based dashboard for monitoring and managing drone data efficiently.

This project is structured into two main components based on the assignment:

-   **Assignment 1 (Backend - API Server)**: Drone Log & Config Server built with **Express.js**. It acts as a secure middleware to connect the client to external data services.
-   **Assignment 2 (Frontend - Client)**: Drone Monitoring Dashboard built with **Vanilla JavaScript, HTML, and TailwindCSS**.

---

## Overview

ระบบนี้เป็น Dashboard ที่พัฒนาขึ้นเพื่อติดตามสถานะและข้อมูลการทำงานของโดรน **(DRONE\_ID: 66010725)** โดยดึงข้อมูลผ่าน API Server ที่สร้างขึ้นเอง มีฟังก์ชันหลักดังนี้:

| Page | Feature | Data Source |
| :--- | :--- | :--- |
| **Page #1: View Config** | แสดงข้อมูลการตั้งค่า (Config) ของ Drone ID ที่กำหนด (เช่น ชื่อ, ประเทศ, สถานะไฟ, Condition) | **Google Sheet/Script API** (ผ่าน Backend) |
| **Page #2: Temperature Log Form** | รับค่า **อุณหภูมิ (°C)** จากผู้ใช้ และส่งข้อมูล Log ไปบันทึก | **PocketBase API** (ผ่าน Backend: `POST /logs`) |
| **Page #3: View Logs** | แสดงประวัติการบันทึกอุณหภูมิทั้งหมด เรียงตามเวลาล่าสุด | **PocketBase API** (ผ่าน Backend: `GET /logs`) |
| **Pagination** | รองรับการแบ่งหน้าสำหรับแสดงผล Log **12 รายการต่อหน้า** | Implemented in Frontend (`app.js`) |

---

## Deployed Links

### Backend (API Server)

Deployed on **Render** (Node.js/Express.js)
➡️ [API Server Link](https://drone-api-server-3r7c.onrender.com)

### Frontend (Client)

The client is designed to be run locally as a static site. When running locally, it communicates with the Deployed API Server or a local server.

* **Local Access:** `http://localhost:3000/index.html` (After running Backend locally)

---

## UI Design

User Interface layouts and components are implemented using standard **HTML** and styled with **TailwindCSS** (via CDN), resulting in a clean and responsive design across all application pages.

Here is an example of the **Temperature Log Form** interface:


---

## Technologies Used

| Category | Technology | File Context |
| :--- | :--- | :--- |
| **Frontend** | HTML, **Vanilla JavaScript** | `index.html`, `app.js`, `logs_view.html` |
| **Styling** | **TailwindCSS** (via CDN) | Utility-first framework for responsive UI design |
| **Backend** | **Node.js, Express.js** | สร้าง RESTful API Server (`server.js`) |
| **Data Sources** | **PocketBase API** | จัดการ Log Records (POST/GET) |
| **Config Source** | **Google Sheets/Script API** | จัดการ Config Data (GET) |
| **Development Tools** | `dotenv`, `cors`, `node-fetch` | Dependencies ใน `package.json` สำหรับการจัดการ API และ Environment |

---

## How to Run the Project Locally

โปรเจกต์นี้ต้องรัน API Server (Backend) ก่อน เพื่อให้ Frontend สามารถเรียกใช้งานได้

### 1. Run Backend (API Server)

1.  เปลี่ยนไดเรกทอรีไปยังโฟลเดอร์ของ Backend (สมมติชื่อ `assignment1_api`):

```bash
cd assignment1_api

## Developer

**Vanichaya Ruengrakrean (66010725)**

KMITL - IoT Systems & Information Engineering
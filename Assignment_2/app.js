const API_BASE_URL = 'https://drone-api-server-3r7c.onrender.com';
const DRONE_ID = '66010725';

const LOGS_PER_PAGE = 12; 
let currentPage = 1;


async function loadAndDisplayConfig() {
    const envDroneIdEl = document.getElementById('env-drone-id');
    if(envDroneIdEl) envDroneIdEl.textContent = DRONE_ID; 

    try {

        const response = await fetch(`${API_BASE_URL}/configs/${DRONE_ID}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        
        const config = await response.json();

        sessionStorage.setItem('droneConfig', JSON.stringify(config));
        
        // 3. แสดงข้อมูลในหน้า web page (ใช้ได้กับ Page #1)
        const configIdEl = document.getElementById('config-id');
        if (configIdEl) configIdEl.textContent = config.drone_id || 'N/A';

        const configNameEl = document.getElementById('config-name');
        if (configNameEl) configNameEl.textContent = config.drone_name || 'N/A';

        const configLightEl = document.getElementById('config-light');
        if (configLightEl) configLightEl.textContent = config.light || 'N/A';

        const configCountryEl = document.getElementById('config-country');
        if (configCountryEl) configCountryEl.textContent = config.country || 'N/A';

        const errorHintEl = document.getElementById('error-hint');
        if (errorHintEl) errorHintEl.classList.add('hidden');

        return config; 
    } catch (error) {
        console.error("Failed to load config:", error);
        const errorHintEl = document.getElementById('error-hint');
        if (errorHintEl) {
            errorHintEl.classList.remove('hidden');
            const errorTextEl = errorHintEl.querySelector('#error-text');
            if(errorTextEl) errorTextEl.textContent = error.message;
        }
        throw error;
    }
}


/**
 * ส่งข้อมูล Log ไปยัง API Server
 * @param {object} logData ข้อมูล Log ที่จะส่ง
 * @returns {Promise<object>} ผลลัพธ์จากการส่ง
 */
async function postLogData(logData) {
    try {
        const response = await fetch(`${API_BASE_URL}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();

        saveLastSubmittedDegree(logData.celsius); 

        return result;
    } catch (error) {
        throw error;
    }
}

async function submitLogForm(event) {
    event.preventDefault(); 

    const submitBtn = document.getElementById('submit-button');
    const celsiusInput = document.getElementById('celsius-input');
    const messageBox = document.getElementById('submission-message');

    const configString = sessionStorage.getItem('droneConfig');
    if (!configString) {
        messageBox.className = "p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm";
        messageBox.textContent = "Error: Config data is missing. Cannot submit log.";
        return;
    }

    try {
        const config = JSON.parse(configString);
        const celsiusStr = celsiusInput.value.trim(); 

        if (celsiusStr === "") {
            messageBox.className = "p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm";
            messageBox.textContent = "กรุณากรอกค่าอุณหภูมิ";
            celsiusInput.focus();
            return;
        }
        
        // การตรวจสอบความเสถียร: แปลงค่า String เป็น Number และตรวจสอบ
        const celsius = parseFloat(celsiusStr); 
        
        if (isNaN(celsius) || !Number.isFinite(celsius)) {
            messageBox.className = "p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm";
            messageBox.textContent = "Error: อุณหภูมิต้องเป็นตัวเลขที่ถูกต้อง (รองรับทศนิยมและค่าลบ)";
            celsiusInput.focus();
            return;
        }


        // 2. เตรียมข้อมูล Log
        const logData = {
            drone_id: config.drone_id,
            drone_name: config.drone_name,
            country: config.country,
            celsius: celsius // ส่งค่าเป็น Number เพื่อความเสถียร
        };

        // 3. ส่งข้อมูล
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> กำลังส่งข้อมูล...';
        
        await postLogData(logData);

        // 4. แสดงผลสำเร็จ
        messageBox.className = "p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm";
        messageBox.textContent = `✅ ส่ง Log สำเร็จ! อุณหภูมิ: ${celsius}°C`;
        celsiusInput.value = ''; 
        
    } catch (error) {
        console.error("Submission failed:", error);
        messageBox.className = "p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm";
        messageBox.textContent = `❌ Error ในการส่ง: ${error.message}. โปรดตรวจสอบ Server API (localhost:3000)`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Submit Data';
    }
}

/**
 * เริ่มต้น Log Form (ผูก Event Listener)
 */
function initLogForm() {
    const configString = sessionStorage.getItem('droneConfig');
    let config = { drone_id: 'N/A', drone_name: 'N/A', country: 'N/A' };
    if (configString) {
        config = JSON.parse(configString);
    }
    
    const formIdEl = document.getElementById('form-drone-id'); 
        if (formIdEl) formIdEl.textContent = config.drone_id;
    const formNameEl = document.getElementById('form-drone-name'); 
        if (formNameEl) formNameEl.textContent = config.drone_name;
    const formCountryEl = document.getElementById('form-country'); 
        if (formCountryEl) formCountryEl.textContent = config.country;
    
    const logForm = document.getElementById('log-form');
    if (logForm) {
        logForm.addEventListener('submit', submitLogForm);
    }
}


// --- C. การจัดการ Log List (Page 3) ---

/**
 * ดึงข้อมูล Log จาก API Server และแสดงผล
 */
async function fetchAndDisplayLogs(page) {
    currentPage = page;
    const tableBody = document.getElementById('log-table-body');
    const paginationControls = document.getElementById('pagination-controls');
    const configString = sessionStorage.getItem('droneConfig');

    if (!configString) {
         if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-red-600 font-bold"><i class="fas fa-exclamation-circle mr-2"></i> ERROR: Config data is missing (Session Storage)!</td></tr>';
        }
        return;
    }
    
    const config = JSON.parse(configString);
    const droneId = config.drone_id;
    
    // แสดงสถานะโหลด
    if (tableBody) {
         tableBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500 font-medium"><i class="fas fa-spinner fa-spin mr-2"></i> กำลังโหลดข้อมูลหน้า ${currentPage}...</td></tr>`;
    }
    if (paginationControls) {
         paginationControls.innerHTML = ''; 
    }

    try {
        // ใช้ drone_id, page, limit=12, และ sort=-created (ล่าสุดขึ้นก่อน) ในการเรียก API
        const response = await fetch(`${API_BASE_URL}/logs?drone_id=${droneId}&page=${page}&limit=${LOGS_PER_PAGE}&sort=-created`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        
        const logs = await response.json();

        // 1. แสดง Log ในตาราง
        renderLogsTable(logs);

        // 2. แสดง Pagination
        // **** แก้ไข: ตรวจสอบว่ามีข้อมูลครบ 12 รายการหรือไม่ ****
        const hasNext = logs.length === LOGS_PER_PAGE;
        renderPagination(hasNext);

    } catch (error) {
        console.error("Failed to fetch and display logs:", error);
        if (tableBody) {
             tableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-red-600 font-bold"><i class="fas fa-exclamation-circle mr-2"></i> ERROR: ไม่สามารถดึง Logs ได้: ${error.message}</td></tr>`;
        }
    }
}

/**
 * แสดง Logs ในตาราง (5 คอลัมน์)
 * @param {Array<object>} logs รายการ Logs
 */
function renderLogsTable(logs) {
    const tableBody = document.getElementById('log-table-body');
    if (!tableBody) return;

    if (logs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-gray-500 font-medium">ไม่พบข้อมูล Log</td></tr>';
        return;
    }

    tableBody.innerHTML = logs.map(log => {
        const formattedDate = new Date(log.created).toLocaleString('th-TH', { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

       return `
            <tr class="log-row hover:bg-sky-50 transition duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${formattedDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">${log.country || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${log.drone_id || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">${log.drone_name || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-lg font-semibold text-sky-600">${log.celsius}°C</td>
            </tr>
        `;
    }).join('');
}

/**
 * สร้างและแสดงปุ่ม Pagination (หน้าก่อนหน้า / หน้าถัดไป)
 */
function renderPagination(hasNext) {
    const paginationControls = document.getElementById('pagination-controls');
    if (!paginationControls) return;

    let html = '';

    // ปุ่ม Previous: แสดงเมื่อไม่ใช่หน้าแรก
    if (currentPage > 1) {
        html += `<button id="prev-page-btn" class="px-4 py-2 mx-1 bg-yellow-500 text-white font-medium rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 transform hover:scale-105" onclick="changePage(-1)">
            <i class="fas fa-chevron-left mr-2"></i> หน้าก่อนหน้า
        </button>`;
    }


    html += `<span class="px-4 py-2 mx-1 bg-gray-200 text-gray-800 font-bold rounded-lg">${currentPage}</span>`;
    if (currentPage === 1 || hasNext) { 
        html += `<button id="next-page-btn" class="px-4 py-2 mx-1 bg-yellow-500 text-white font-medium rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 transform hover:scale-105" onclick="changePage(1)">
            หน้าถัดไป <i class="fas fa-chevron-right ml-2"></i>
        </button>`;
    }
    
    paginationControls.innerHTML = html;
}

function changePage(delta) {
    const newPage = currentPage + delta;
    if (newPage >= 1) {
        fetchAndDisplayLogs(newPage);
    }
}


/**

 * @param {string} celsiusDegree
 */
function saveLastSubmittedDegree(celsiusDegree) {
    sessionStorage.setItem('lastSubmittedCelsius', celsiusDegree);
}

function displayLastSubmittedDegree() {
    const lastDegree = sessionStorage.getItem('lastSubmittedCelsius');
    const displayEl = document.getElementById('last-submitted-display');
    const degreeEl = document.getElementById('last-celsius-degree');

 
    if (lastDegree && displayEl && degreeEl) {
        degreeEl.textContent = lastDegree;
        displayEl.classList.remove('hidden'); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('index.html') || path.includes('config.html')) {
        loadAndDisplayConfig(); 
    }

    else if (path.includes('log_form.html')) {
        loadAndDisplayConfig()
            .then(() => {
                initLogForm();
            })
            .catch((error) => {
                console.error("Critical: Config load failed for Log Form. Form data may be incomplete.", error);
                initLogForm(); 
            });
    } 

    else if (path.includes('logs_view.html') || path.includes('logs.html')) {
        loadAndDisplayConfig()
            .then(() => {
                displayLastSubmittedDegree(); 
                fetchAndDisplayLogs(1); // เริ่มต้นที่หน้า 1
            })
            .catch((error) => {
                console.error("Critical: Failed to load config, cannot fetch logs.", error);
                const tableBody = document.getElementById('log-table-body');
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-red-600 font-bold"><i class="fas fa-exclamation-circle mr-2"></i> ERROR: Configs Load Failed! ตรวจสอบ API Server (localhost:3000)</td></tr>';
                }
            });

        document.getElementById('prev-page-btn')?.addEventListener('click', () => changePage(-1));
        document.getElementById('next-page-btn')?.addEventListener('click', () => changePage(1));
    }

    document.getElementById('refresh-log-btn')?.addEventListener('click', () => fetchAndDisplayLogs(currentPage));

});
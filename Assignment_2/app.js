const API_BASE_URL = 'https://drone-api-server-3r7c.onrender.com';
const DRONE_ID = '66010725';

const LOGS_PER_PAGE = 12;
let currentPage = 1;


async function loadAndDisplayConfig() {
    const envDroneIdEl = document.getElementById('env-drone-id');
    if (envDroneIdEl) envDroneIdEl.textContent = DRONE_ID;

    try {

        const response = await fetch(`${API_BASE_URL}/configs/${DRONE_ID}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const config = await response.json();

        sessionStorage.setItem('droneConfig', JSON.stringify(config));

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
            if (errorTextEl) errorTextEl.textContent = error.message;
        }
        throw error;
    }
}

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

        const celsius = parseFloat(celsiusStr);

        if (isNaN(celsius) || !Number.isFinite(celsius)) {
            messageBox.className = "p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm";
            messageBox.textContent = "Error: อุณหภูมิต้องเป็นตัวเลขที่ถูกต้อง (รองรับทศนิยมและค่าลบ)";
            celsiusInput.focus();
            return;
        }


        const logData = {
            drone_id: config.drone_id,
            drone_name: config.drone_name,
            country: config.country,
            celsius: celsius
        };

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> กำลังส่งข้อมูล...';

        await postLogData(logData);

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


async function fetchAndDisplayLogs(page) {
    const tableBody = document.getElementById('log-table-body');
    const controls = document.getElementById('pagination-controls');
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500 font-medium"><i class="fas fa-spinner fa-spin mr-2"></i> กำลังโหลดข้อมูล...</td></tr>`;
    if (controls) controls.innerHTML = '';

    currentPage = page;

    try {
        const response = await fetch(`${API_BASE_URL}/logs?page=${page}&limit=${LOGS_PER_PAGE}`);

        if (!response.ok) {
            throw new Error(`API Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const logs = data.items;
        const totalPages = data.totalPages || 1;
        currentPage = data.currentPage || 1;

        if (tableBody) tableBody.innerHTML = '';
        if (logs.length === 0) {
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-gray-500 font-medium"><i class="fas fa-info-circle mr-2"></i> ไม่พบ Log ข้อมูล</td></tr>`;
        } else {
            logs.forEach(log => {
                const createdDate = new Date(log.created).toLocaleString('th-TH', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });

                const newRow = tableBody.insertRow();
                newRow.className = "log-row hover:bg-sky-50 transition duration-150";
                newRow.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${createdDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">${log.country || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${log.drone_id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">${log.drone_name || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-lg font-semibold text-sky-600">${log.celsius.toFixed(2)}°C</td>
                `;
            });
        }

        updatePaginationControls(totalPages);

    } catch (error) {
        console.error("Error fetching and displaying logs:", error);
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-red-600 font-bold"><i class="fas fa-exclamation-circle mr-2"></i> ERROR: ดึง Logs ไม่สำเร็จ! ${error.message}</td></tr>`;
        if (controls) controls.innerHTML = '';
    }
}

function updatePaginationControls(totalPages) {
    const controls = document.getElementById('pagination-controls');
    if (!controls) return;



    controls.innerHTML = `
        <button id="prev-page-btn" class="px-4 py-2 mr-3 rounded-lg font-bold transition duration-300 ${currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-sky-500 text-white hover:bg-sky-600'}" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-arrow-left mr-1"></i> Prev
        </button>
        <span class="text-sm sm:text-base font-bold text-gray-700"> 
            Page <span id="current-page-display">${currentPage}</span> of ${totalPages} 
        </span>
        <button id="next-page-btn" class="px-4 py-2 ml-3 rounded-lg font-bold transition duration-300 ${currentPage >= totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-sky-500 text-white hover:bg-sky-600'}" ${currentPage >= totalPages ? 'disabled' : ''}> 
            Next <i class="fas fa-arrow-right ml-1"></i> 
        </button>
    `;


    document.getElementById('prev-page-btn')?.addEventListener('click', () => changePage(-1));
    document.getElementById('next-page-btn')?.addEventListener('click', () => changePage(1));
}


function changePage(delta) {
    const newPage = currentPage + delta;
    // ตรวจสอบว่าไม่เกินหน้าแรก (1)
    if (newPage >= 1) {
        fetchAndDisplayLogs(newPage);
    }
}

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
                fetchAndDisplayLogs(1);
            })
            .catch((error) => {
                console.error("Critical: Failed to load config, cannot fetch logs.", error);
                const tableBody = document.getElementById('log-table-body');
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-red-600 font-bold"><i class="fas fa-exclamation-circle mr-2"></i> ERROR: Configs Load Failed! ตรวจสอบ API Server (localhost:3000)</td></tr>';
                }
            });
    }

    document.getElementById('refresh-log-btn')?.addEventListener('click', () => fetchAndDisplayLogs(currentPage));

});
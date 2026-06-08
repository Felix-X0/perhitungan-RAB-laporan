// Struktur Data Master Standar Proyek Teknik Sipil (WBS Lengkap 6 Divisi)
const masterDivisions = [
    { code: "I", name: "PEKERJAAN PERSIAPAN & SMK3 PROYEK" },
    { code: "II", name: "PEKERJAAN TANAH, GALIAN DAN PONDASI" },
    { code: "III", name: "PEKERJAAN STRUKTUR BETON BERTULANG MURNI" },
    { code: "IV", name: "PEKERJAAN DINDING, ARSITEKTUR DAN LANTAI" },
    { code: "V", name: "PEKERJAAN RANGKA ATAP DAN PLAFOND" },
    { code: "VI", name: "PEKERJAAN ELEKTRIKAL & MEKANIKAL (SANITER)" }
];

const defaultItems = [
    { id: "1.1", div: "I", job: "Direksikit, Papan Nama Proyek & Pembersihan Awal", unit: "Lsm", qty: 1, price: 2500000, progress: 100 },
    { id: "1.2", div: "I", job: "Pengukuran Koordinat & Pasang Bouwplank Kayu", unit: "M1", qty: 45, price: 95000, progress: 100 },
    { id: "2.1", div: "II", job: "Galian Tanah Keras Pondasi Lajur", unit: "M3", qty: 32, price: 85000, progress: 80 },
    { id: "2.2", div: "II", job: "Pasangan Batu Kali Belah Campuran 1:4", unit: "M3", qty: 22, price: 890000, progress: 40 },
    { id: "3.1", div: "III", job: "Pekerjaan Cor Beton Sloof Uk. 15/20 (K-225)", unit: "M3", qty: 3.8, price: 4100000, progress: 0 },
    { id: "4.1", div: "IV", job: "Pasangan Dinding Bata Merah h=3m Pasangan 1:5", unit: "M2", qty: 165, price: 135000, progress: 0 },
    { id: "5.1", div: "V", job: "Pasang Rangka Atap Baja Ringan Standard Penutup Genteng", unit: "M2", qty: 85, price: 210000, progress: 0 },
    { id: "6.1", div: "VI", job: "Instalasi Titik Lampu Utama Kabel NYM & Stopkontak", unit: "Titik", qty: 14, price: 275000, progress: 0 }
];

// Otomatisasi pembacaan halaman aktif saat file di-load browser
document.addEventListener("DOMContentLoaded", () => {
    initSipilApp();
});

function initSipilApp() {
    // Jalankan logika sesuai file halaman yang sedang terbuka oleh user
    if (document.getElementById("p_name")) {
        loadDashboardPage();
    } else if (document.getElementById("rabTableBody")) {
        renderRABPage();
    } else if (document.getElementById("lapTableBody")) {
        renderLaporanPage();
    }
}

// LOGIKA HALAMAN 1: DASHBOARD
function saveProjectInfo() {
    const info = {
        name: document.getElementById("p_name").value,
        loc: document.getElementById("p_loc").value,
        contract: document.getElementById("p_contract").value,
        owner: document.getElementById("p_owner").value,
        contractor: document.getElementById("p_contractor").value,
        supervisor: document.getElementById("p_supervisor").value
    };
    localStorage.setItem("sipil_project_info", JSON.stringify(info));
    alert("Data Administrasi Berhasil Disimpan!");
    window.location.href = "rab.html"; // Otomatis pindah halaman ke penyusunan RAB
}

function loadDashboardPage() {
    const saved = localStorage.getItem("sipil_project_info");
    if (saved) {
        const info = JSON.parse(saved);
        document.getElementById("p_name").value = info.name;
        document.getElementById("p_loc").value = info.loc;
        document.getElementById("p_contract").value = info.contract;
        document.getElementById("p_owner").value = info.owner;
        document.getElementById("p_contractor").value = info.contractor;
        document.getElementById("p_supervisor").value = info.supervisor;
    }
}

// LOGIKA HALAMAN 2: PENYUSUNAN RAB
function renderRABPage() {
    const info = JSON.parse(localStorage.getItem("sipil_project_info")) || { name: "Proyek Konstruksi" };
    document.getElementById("headerProjName").innerText = "RAB: " + info.name;

    let items = JSON.parse(localStorage.getItem("sipil_items_data"));
    if (!items) { items = defaultItems; localStorage.setItem("sipil_items_data", JSON.stringify(items)); }

    const tbody = document.getElementById("rabTableBody");
    tbody.innerHTML = "";

    masterDivisions.forEach(div => {
        // Cetak Baris Kepala Judul Divisi Pekerjaan
        const divRow = document.createElement("tr");
        divRow.className = "row-division";
        divRow.innerHTML = `<td>${div.code}</td><td colspan="5">${div.name}</td>`;
        tbody.appendChild(divRow);

        // Ambil item-item yang masuk kategori divisi ini
        const subItems = items.filter(i => i.div === div.code);
        subItems.forEach((item, index) => {
            const tr = document.createElement("tr");
            const rowTotal = item.qty * item.price;
            tr.innerHTML = `
                <td class="text-center">${div.code}.${index + 1}</td>
                <td><input type="text" value="${item.job}" onchange="updateRABValue('${item.id}', 'job', this.value)"></td>
                <td><input type="number" value="${item.qty}" step="any" oninput="updateRABValue('${item.id}', 'qty', this.value)"></td>
                <td><input type="text" value="${item.unit}" onchange="updateRABValue('${item.id}', 'unit', this.value)"></td>
                <td><input type="number" value="${item.price}" oninput="updateRABValue('${item.id}', 'price', this.value)"></td>
                <td class="text-right" style="font-weight:bold;">Rp ${Math.round(rowTotal).toLocaleString("id-ID")}</td>
            `;
            tbody.appendChild(tr);
        });
    });
    calculateRABTotalScore();
}

function updateRABValue(id, key, value) {
    let items = JSON.parse(localStorage.getItem("sipil_items_data"));
    let item = items.find(i => i.id === id);
    if (item) {
        item[key] = key === 'qty' || key === 'price' ? parseFloat(value) || 0 : value;
        localStorage.setItem("sipil_items_data", JSON.stringify(items));
    }
    // Re-render cepat jumlah harga tanpa merusak fokus input ketikan user
    calculateRABTotalScore();
}

function calculateRABTotalScore() {
    let items = JSON.parse(localStorage.getItem("sipil_items_data")) || defaultItems;
    let grandTotal = 0;
    items.forEach(i => { grandTotal += (i.qty * i.price); });
    document.getElementById("txtTotalRAB").innerText = "Rp " + Math.round(grandTotal).toLocaleString("id-ID");
}

function saveRABData() {
    alert("Seluruh struktur Anggaran RAB berhasil dibekukan ke memori sistem!");
    window.location.href = "laporan.html"; // Otomatis meloncat ke lembar kendali lapangan
}

// LOGIKA HALAMAN 3: MONITORING LAPORAN PROGRES
function renderLaporanPage() {
    const info = JSON.parse(localStorage.getItem("sipil_project_info")) || {};
    if (info.name) {
        document.getElementById("lapProjName").innerText = "LAPORAN KEMAJUAN FISIK: " + info.name.toUpperCase();
        document.getElementById("lapProjMeta").innerText = `KONTRAK: ${info.contract} | LOKASI: ${info.loc} | PELAKSANA: ${info.contractor}`;
    }

    let items = JSON.parse(localStorage.getItem("sipil_items_data")) || defaultItems;
    const tbody = document.getElementById("lapTableBody");
    tbody.innerHTML = "";

    let totalRAB = 0;
    items.forEach(i => { totalRAB += (i.qty * i.price); });

    let calculatedTotalProgressValue = 0;

    masterDivisions.forEach(div => {
        const divRow = document.createElement("tr");
        divRow.className = "row-division";
        divRow.innerHTML = `<td>${div.code}</td><td colspan="7">${div.name}</td>`;
        tbody.appendChild(divRow);

        const subItems = items.filter(i => i.div === div.code);
        subItems.forEach((item, index) => {
            const tr = document.createElement("tr");
            const itemTotalCost = item.qty * item.price;
            const progressValue = (item.progress / 100) * itemTotalCost;
            calculatedTotalProgressValue += progressValue;

            tr.innerHTML = `
                <td class="text-center">${div.code}.${index + 1}</td>
                <td>${item.job}</td>
                <td class="text-center">${item.unit}</td>
                <td class="text-right">${item.qty}</td>
                <td class="text-right">Rp ${Math.round(item.price).toLocaleString("id-ID")}</td>
                <td class="text-right" style="font-weight:600;">Rp ${Math.round(itemTotalCost).toLocaleString("id-ID")}</td>
                <td><input type="number" value="${item.progress}" min="0" max="100" style="font-weight:bold; color:blue;" oninput="updateProgressField('${item.id}', this.value)"></td>
                <td class="text-right" style="font-weight:bold;">Rp ${Math.round(progressValue).toLocaleString("id-ID")}</td>
            `;
            tbody.appendChild(tr);
        });
    });

    // Perhitungan Rekapitulasi Akhir Neraca Kontraktor Sipil
    document.getElementById("summaryTotalRAB").innerText = "Rp " + Math.round(totalRAB).toLocaleString("id-ID");
    document.getElementById("summaryTotalProgVal").innerText = "Rp " + Math.round(calculatedTotalProgressValue).toLocaleString("id-ID");
    
    let totalProgressPercent = totalRAB > 0 ? (calculatedTotalProgressValue / totalRAB) * 100 : 0;
    document.getElementById("summaryTotalProgPercent").innerText = totalProgressPercent.toFixed(2) + "%";
}

function updateProgressField(id, val) {
    let items = JSON.parse(localStorage.getItem("sipil_items_data"));
    let item = items.find(i => i.id === id);
    if (item) {
        item.progress = parseFloat(val) || 0;
        localStorage.setItem("sipil_items_data", JSON.stringify(items));
    }
    // Realtime update rangkuman kalkulasi lembar pengawasan tanpa reload halaman
    let totalRAB = 0;
    let totalProgVal = 0;
    items.forEach(i => {
        let cost = i.qty * i.price;
        totalRAB += cost;
        totalProgVal += ((i.progress / 100) * cost);
    });
    document.getElementById("summaryTotalProgVal").innerText = "Rp " + Math.round(totalProgVal).toLocaleString("id-ID");
    let totalProgressPercent = totalRAB > 0 ? (totalProgVal / totalRAB) * 100 : 0;
    document.getElementById("summaryTotalProgPercent").innerText = totalProgressPercent.toFixed(2) + "%";
}

// SISTEM AUTOMATIC EXCEL GENERATOR (STANDAR LAPORAN DINAS SIPIL)
function exportToSipilExcel() {
    const table = document.getElementById("excelExportTable");
    const wb = XLSX.utils.table_to_book(table, { sheet: "Laporan Opname Progres" });
    const info = JSON.parse(localStorage.getItem("sipil_project_info")) || { name: "Proyek" };
    XLSX.writeFile(wb, `Laporan_Fisik_${info.name.replace(/ /g, "_")}.xlsx`);
}

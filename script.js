let masterDivisions = [
    { code: "I", name: "PEKERJAAN PERSIAPAN & SMK3 PROYEK" },
    { code: "II", name: "PEKERJAAN TANAH, GALIAN DAN PONDASI" },
    { code: "III", name: "PEKERJAAN STRUKTUR BETON BERTULANG MURNI" },
    { code: "IV", name: "PEKERJAAN DINDING, ARSITEKTUR DAN LANTAI" }
];

const defaultItems = [
    { id: "1.1", div: "I", job: "Pembersihan Lahan", unit: "Lsm", qty: 1, price: 1500000, progress: 0 },
    { id: "2.1", div: "II", job: "Galian Tanah Pondasi", unit: "M3", qty: 20, price: 85000, progress: 0 }
];

document.addEventListener("DOMContentLoaded", () => { initSipilApp(); });

function initSipilApp() {
    if (!localStorage.getItem("sipil_divisions")) {
        localStorage.setItem("sipil_divisions", JSON.stringify(masterDivisions));
    }
    masterDivisions = JSON.parse(localStorage.getItem("sipil_divisions"));

    if (document.getElementById("p_name")) loadDashboardPage();
    else if (document.getElementById("rabTableBody")) { renderRABPage(); populateDivisionDropdown(); }
    else if (document.getElementById("lapTableBody")) renderLaporanPage();
}

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
    window.location.href = "rab.html";
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

function populateDivisionDropdown() {
    const select = document.getElementById("selDivision");
    if (!select) return;
    select.innerHTML = "";
    masterDivisions.forEach(div => {
        const opt = document.createElement("option");
        opt.value = div.code; opt.innerText = `Tabel ${div.code} - ${div.name}`; select.appendChild(opt);
    });
}

function renderRABPage() {
    const info = JSON.parse(localStorage.getItem("sipil_project_info")) || { name: "Proyek Konstruksi" };
    document.getElementById("headerProjName").innerText = "RAB: " + info.name;
    let items = JSON.parse(localStorage.getItem("sipil_items_data"));
    if (!items) { items = defaultItems; localStorage.setItem("sipil_items_data", JSON.stringify(items)); }

    const tbody = document.getElementById("rabTableBody"); tbody.innerHTML = "";
    masterDivisions.forEach(div => {
        const divRow = document.createElement("tr"); divRow.className = "row-division";
        divRow.innerHTML = `<td>${div.code}</td><td colspan="6">${div.name}</td>`; tbody.appendChild(divRow);
        const subItems = items.filter(i => i.div === div.code);
        subItems.forEach((item, index) => {
            const tr = document.createElement("tr"); const rowTotal = item.qty * item.price;
            tr.innerHTML = `
                <td class="text-center">${div.code}.${index + 1}</td>
                <td><input type="text" value="${item.job}" onchange="updateRABValue('${item.id}', 'job', this.value)"></td>
                <td><input type="number" value="${item.qty}" step="any" oninput="updateRABValue('${item.id}', 'qty', this.value)"></td>
                <td><input type="text" value="${item.unit}" onchange="updateRABValue('${item.id}', 'unit', this.value)"></td>
                <td><input type="number" value="${item.price}" oninput="updateRABValue('${item.id}', 'price', this.value)"></td>
                <td class="text-right" style="font-weight:bold;">Rp ${Math.round(rowTotal).toLocaleString("id-ID")}</td>
                <td class="no-print text-center"><button class="btn btn-red" onclick="deleteItemDynamic('${item.id}')">X</button></td>
            `;
            tbody.appendChild(tr);
        });
    });
    calculateRABTotalScore();
}

function updateRABValue(id, key, value) {
    let items = JSON.parse(localStorage.getItem("sipil_items_data"));
    let item = items.find(i => i.id === id);
    if (item) { item[key] = key === 'qty' || key === 'price' ? parseFloat(value) || 0 : value; localStorage.setItem("sipil_items_data", JSON.stringify(items)); }
    calculateRABTotalScore();
}

function calculateRABTotalScore() {
    let items = JSON.parse(localStorage.getItem("sipil_items_data")) || defaultItems;
    let grandTotal = 0;
    masterDivisions.forEach(div => {
        const subItems = items.filter(i => i.div === div.code);
        subItems.forEach(item => {
            grandTotal += (item.qty * item.price);
            const rTotal = item.qty * item.price;
            const tableRows = document.querySelectorAll("#rabTableBody tr");
            tableRows.forEach(tr => {
                if(tr.cells[0] && tr.cells[0].innerText === `${item.div}.${subItems.indexOf(item)+1}`) {
                    if(tr.cells[5]) tr.cells[5].innerText = "Rp " + Math.round(rTotal).toLocaleString("id-ID");
                }
            });
        });
    });
    document.getElementById("txtTotalRAB").innerText = "Rp " + Math.round(grandTotal).toLocaleString("id-ID");
}

function addNewItemDynamic() {
    const divCode = document.getElementById("selDivision").value;
    let items = JSON.parse(localStorage.getItem("sipil_items_data")) || [];
    items.push({ id: divCode + "_" + Date.now(), div: divCode, job: "Pekerjaan Baru", unit: "M3", qty: 0, price: 0, progress: 0 });
    localStorage.setItem("sipil_items_data", JSON.stringify(items)); renderRABPage();
}

function addNewDivisionDynamic() {
    const txtName = document.getElementById("newDivName").value.trim();
    if (!txtName) return;
    const romanCodes = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
    const nextCode = romanCodes[masterDivisions.length] || "X" + masterDivisions.length;
    masterDivisions.push({ code: nextCode, name: txtName.toUpperCase() });
    localStorage.setItem("sipil_divisions", JSON.stringify(masterDivisions));
    document.getElementById("newDivName").value = ""; populateDivisionDropdown(); renderRABPage();
}

function deleteItemDynamic(id) {
    if(confirm("Hapus pekerjaan ini?")) {
        let items = JSON.parse(localStorage.getItem("sipil_items_data")) || [];
        items = items.filter(i => i.id !== id); localStorage.setItem("sipil_items_data", JSON.stringify(items)); renderRABPage();
    }
}

function saveRABData() { window.location.href = "laporan.html"; }

function renderLaporanPage() {
    const info = JSON.parse(localStorage.getItem("sipil_project_info")) || {};
    if (info.name) {
        document.getElementById("lapProjName").innerText = "LAPORAN KEMAJUAN FISIK: " + info.name.toUpperCase();
        document.getElementById("lapProjMeta").innerText = `KONTRAK: ${info.contract} | LOKASI: ${info.loc} | KONTRAKTOR: ${info.contractor}`;
    }
    let items = JSON.parse(localStorage.getItem("sipil_items_data")) || defaultItems;
    const tbody = document.getElementById("lapTableBody"); tbody.innerHTML = "";
    let totalRAB = 0; let calculatedTotalProgressValue = 0;

    masterDivisions.forEach(div => {
        const subItems = items.filter(i => i.div === div.code);
        if (subItems.length === 0) return;
        const divRow = document.createElement("tr"); divRow.className = "row-division";
        divRow.innerHTML = `<td>${div.code}</td><td colspan="7">${div.name}</td>`; tbody.appendChild(divRow);

        subItems.forEach((item, index) => {
            const tr = document.createElement("tr");
            const itemTotalCost = item.qty * item.price;
            const progressValue = (item.progress / 100) * itemTotalCost;
            totalRAB += itemTotalCost; calculatedTotalProgressValue += progressValue;
            tr.innerHTML = `
                <td class="text-center">${div.code}.${index + 1}</td>
                <td>${item.job}</td><td class="text-center">${item.unit}</td><td class="text-right">${item.qty.toLocaleString("id-ID")}</td>
                <td class="text-right">Rp ${Math.round(item.price).toLocaleString("id-ID")}</td>
                <td class="text-right" style="font-weight:600;">Rp ${Math.round(itemTotalCost).toLocaleString("id-ID")}</td>
                <td><input type="number" value="${item.progress}" min="0" max="100" style="font-weight:bold; color:blue;" oninput="updateProgressField('${item.id}', this.value)"></td>
                <td class="text-right" style="font-weight:bold;">Rp ${Math.round(progressValue).toLocaleString("id-ID")}</td>
            `;
            tbody.appendChild(tr);
        });
    });
    document.getElementById("summaryTotalRAB").innerText = "Rp " + Math.round(totalRAB).toLocaleString("id-ID");
    document.getElementById("summaryTotalProgVal").innerText = "Rp " + Math.round(calculatedTotalProgressValue).toLocaleString("id-ID");
    let totalProgressPercent = totalRAB > 0 ? (calculatedTotalProgressValue / totalRAB) * 100 : 0;
    document.getElementById("summaryTotalProgPercent").innerText = totalProgressPercent.toFixed(2) + "%";
}

function updateProgressField(id, val) {
    let items = JSON.parse(localStorage.getItem("sipil_items_data"));
    let item = items.find(i => i.id === id);
    if (item) { item.progress = parseFloat(val) || 0; localStorage.setItem("sipil_items_data", JSON.stringify(items)); }
    
    let totalRAB = 0; let totalProgVal = 0;
    items.forEach(i => { let cost = i.qty * i.price; totalRAB += cost; totalProgVal += ((i.progress / 100) * cost); });
    document.getElementById("summaryTotalProgVal").innerText = "Rp " + Math.round(totalProgVal).toLocaleString("id-ID");
    let totalProgressPercent = totalRAB > 0 ? (totalProgVal / totalRAB) * 100 : 0;
    document.getElementById("summaryTotalProgPercent").innerText = totalProgressPercent.toFixed(2) + "%";
}

function exportToSipilExcelPro() {
    const info = JSON.parse(localStorage.getItem("sipil_project_info")) || {};
    let items = JSON.parse(localStorage.getItem("sipil_items_data")) || [];
    let dataExcel = [];
    dataExcel.push(["LAPORAN REALISASI ANGGARAN BIAYA & PROGRES FISIK KONSTRUKSI"]);
    dataExcel.push(["NAMA PROYEK:", info.name || "-"]); dataExcel.push(["NOMOR KONTRAK:", info.contract || "-"]);
    dataExcel.push(["LOKASI:", info.loc || "-"]); dataExcel.push(["KONTRAKTOR:", info.contractor || "-"]); dataExcel.push([]); 
    dataExcel.push(["No", "Uraian Item Pekerjaan", "Satuan", "Volume Kontrak", "Harga Satuan (Rp)", "Jumlah Harga RAB (Rp)", "Progres Lapangan (%)", "Nilai Realisasi Fisik (Rp)"]);

    let totalRAB = 0; let totalFisik = 0;
    masterDivisions.forEach(div => {
        const subItems = items.filter(i => i.div === div.code);
        if(subItems.length === 0) return;
        dataExcel.push([div.code, div.name, "", "", "", "", "", ""]);
        subItems.forEach((item, index) => {
            const jumlahHarga = item.qty * item.price; const nilaiFisik = (item.progress / 100) * jumlahHarga;
            totalRAB += jumlahHarga; totalFisik += nilaiFisik;
            dataExcel.push([`${div.code}.${index + 1}`, item.job, item.unit, item.qty, item.price, jumlahHarga, item.progress, nilaiFisik]);
        });
    });
    dataExcel.push([]); 
    dataExcel.push(["", "TOTAL NILAI KONTRAK & REALISASI", "", "", "", totalRAB, (totalFisik/totalRAB*100), totalFisik]);

    const ws = XLSX.utils.aoa_to_sheet(dataExcel);
    const lebarKolom = [{ wch: 8 }, { wch: 50 }, { wch: 10 }, { wch: 15 }, { wch: 18 }, { wch: 22 }, { wch: 15 }, { wch: 22 }];
    ws['!cols'] = lebarKolom;

    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Laporan Opname Progres");
    XLSX.writeFile(wb, `Laporan_Progres_Pro_` + (info.name ? info.name.replace(/ /g, "_") : "Sipil") + `.xlsx`);
}

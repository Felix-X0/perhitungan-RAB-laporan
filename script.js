// Menjalankan perhitungan otomatis saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", () => {
    mainCalculator();
});

// Fungsi Utama Kalkulasi Teknik Sipil Terintegrasi
function mainCalculator() {
    const rows = document.querySelectorAll(".row-item");
    let totalRAB = 0;

    // Langkah 1: Hitung Jumlah Harga Kontrak per Item Pekerjaan
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector(".input-qty").value) || 0;
        const price = parseFloat(row.querySelector(".input-price").value) || 0;
        const totalPrice = qty * price;
        
        row.querySelector(".cell-total-price").innerText = formatRupiah(totalPrice);
        row.setAttribute("data-total-harga", totalPrice); // Menyimpan nilai angka murni
        totalRAB += totalPrice;
    });

    // Menampilkan Total Anggaran Biaya Proyek (RAB)
    document.getElementById("lblTotalRAB").innerText = formatRupiah(totalRAB);

    // Langkah 2 & 3: Hitung Bobot Rencana & Nilai Opname Riil Lapangan
    let totalWeightAccumulated = 0;
    let totalProgressValueAccumulated = 0;

    rows.forEach(row => {
        const itemPrice = parseFloat(row.getAttribute("data-total-harga")) || 0;
        
        // Rumus Sipil: Bobot % = (Harga Item / Total Nilai Proyek) * 100
        let itemWeight = totalRAB > 0 ? (itemPrice / totalRAB) * 100 : 0;
        row.querySelector(".cell-weight").innerText = itemWeight.toFixed(2) + "%";
        totalWeightAccumulated += itemWeight;

        // Membaca input nilai progres lapangan (%)
        const progressPercent = parseFloat(row.querySelector(".input-progress").value) || 0;
        
        // Rumus Sipil: Nilai Progres Rp = (Progres Fisik % / 100) * Harga Kontrak Item
        const progressValue = (progressPercent / 100) * itemPrice;
        row.querySelector(".cell-progress-value").innerText = formatRupiah(progressValue);
        totalProgressValueAccumulated += progressValue;
    });

    // Menampilkan Akumulasi Parameter Progress di Box Rekapitulasi
    document.getElementById("lblTotalWeight").innerText = totalWeightAccumulated.toFixed(0) + ".00%";
    document.getElementById("lblTotalProgressValue").innerText = formatRupiah(totalProgressValueAccumulated);
    
    // Rumus Akumulasi Progres Fisik Total Proyek (%)
    let totalProgressPercent = totalRAB > 0 ? (totalProgressValueAccumulated / totalRAB) * 100 : 0;
    document.getElementById("lblTotalProgressPercent").innerText = totalProgressPercent.toFixed(2) + "%";
}

// Fungsi Menambahkan Baris Item Baru di Bawah Divisi yang Dipilih
function addDivisionItem(divId) {
    const tbody = document.getElementById("tableBody");
    const targetDivisionRow = Array.from(tbody.querySelectorAll(".row-division")).find(row => {
        return row.cells[0].innerText.trim() === divId;
    });

    if (!targetDivisionRow) return;

    // Mencari baris terakhir di divisi tersebut untuk menyisipkan baris baru di bawahnya
    let lastRowOfDivision = targetDivisionRow;
    let nextRow = targetDivisionRow.nextElementSibling;
    while (nextRow && !nextRow.classList.contains("row-division")) {
        lastRowOfDivision = nextRow;
        nextRow = nextRow.nextElementSibling;
    }

    const tr = document.createElement("tr");
    tr.className = "row-item";
    tr.setAttribute("data-division", divId);
    tr.innerHTML = `
        <td>${divId}.x</td>
        <td><input type="text" class="input-job" placeholder="Nama Pekerjaan Baru"></td>
        <td><input type="text" class="input-unit" placeholder="Satuan"></td>
        <td><input type="number" class="input-qty" value="0" oninput="mainCalculator()"></td>
        <td><input type="number" class="input-price" value="0" oninput="mainCalculator()"></td>
        <td class="cell-total-price">Rp 0</td>
        <td class="cell-weight">0.00%</td>
        <td><input type="number" class="input-progress" value="0" min="0" max="100" oninput="mainCalculator()"></td>
        <td class="cell-progress-value">Rp 0</td>
    `;

    lastRowOfDivision.insertAdjacentElement("afterend", tr);
    reindexItemNumbers();
    mainCalculator();
}

// Merapikan Kode Penomoran Sub-Item (Contoh: 1.1, 1.2, 1.3) Otomatis
function reindexItemNumbers() {
    ["I", "II"].forEach(divId => {
        const items = document.querySelectorAll(`.row-item[data-division="${divId}"]`);
        items.forEach((item, index) => {
            item.cells[0].innerText = `${divId}.${index + 1}`;
        });
    });
}

// Format Angka ke Rupiah Indonesia Kontrak Konstruksi
function formatRupiah(angka) {
    return "Rp " + Math.round(angka).toLocaleString("id-ID");
}

// Handler Ekspor Otomatis Menjadi Spreadsheet Excel Resmi (.xlsx)
function exportExcelSipil() {
    const table = document.getElementById("sipilTable");
    const wb = XLSX.utils.table_to_book(table, { sheet: "Laporan Opname Progres" });
    const fileName = document.getElementById("projectName").value.replace(/ /g, "_");
    XLSX.writeFile(wb, `Laporan_Fisik_RAB_${fileName}.xlsx`);
}

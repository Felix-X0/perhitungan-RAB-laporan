// Mengatur tanggal otomatis hari ini pada form proyek
document.getElementById('projectDate').valueAsDate = new Date();

// Fungsi menambahkan baris pekerjaan baru ke tabel
function addRow() {
    const tbody = document.getElementById('rabBody');
    const rowCount = tbody.rows.length + 1;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="row-number">${rowCount}</td>
        <td><input type="text" class="input-job" placeholder="Nama Pekerjaan Baru"></td>
        <td><input type="number" class="input-qty" value="0" oninput="calculateRow(this)"></td>
        <td><input type="text" class="input-unit" placeholder="satuan"></td>
        <td><input type="number" class="input-price" value="0" oninput="calculateRow(this)"></td>
        <td class="row-total">Rp 0</td>
        <td class="no-print"><button class="btn-delete" onclick="deleteRow(this)">Hapus</button></td>
    `;
    tbody.appendChild(tr);
    updateRowNumbers();
    calculateGrandTotal();
}

// Fungsi menghapus baris tabel
function deleteRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateRowNumbers();
    calculateGrandTotal();
}

// Merapikan kembali urutan nomor (1, 2, 3...) jika ada baris yang dihapus
function updateRowNumbers() {
    const rows = document.querySelectorAll('#rabBody tr');
    rows.forEach((row, index) => {
        row.querySelector('.row-number').innerText = index + 1;
    });
}

// Menghitung subtotal per baris otomatis (Volume x Harga Satuan)
function calculateRow(input) {
    const row = input.parentNode.parentNode;
    const qty = parseFloat(row.querySelector('.input-qty').value) || 0;
    const price = parseFloat(row.querySelector('.input-price').value) || 0;
    
    const total = qty * price;
    row.querySelector('.row-total').innerText = formatRupiah(total);
    
    calculateGrandTotal();
}

// Menghitung akumulasi nilai keseluruhan (Subtotal, PPN, dan Total Akhir)
function calculateGrandTotal() {
    const rows = document.querySelectorAll('#rabBody tr');
    let subTotal = 0;
    
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.input-qty').value) || 0;
        const price = parseFloat(row.querySelector('.input-price').value) || 0;
        subTotal += (qty * price);
    });
    
    const tax = subTotal * 0.11; // PPN Standar 11%
    const grandTotal = subTotal + tax;
    
    document.getElementById('subTotal').innerText = formatRupiah(subTotal);
    document.getElementById('taxTotal').innerText = formatRupiah(tax);
    document.getElementById('grandTotal').innerText = formatRupiah(grandTotal);
}

// Helper pengubah angka murni menjadi format mata uang Rupiah teks
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// Sistem Ekspor Tabel Terkonversi Menjadi File Excel murni (.xlsx)
function exportToExcel() {
    const projectName = document.getElementById('projectName').value || 'Proyek';
    
    // Konversi tabel HTML menjadi struktur data Excel sheet
    const table = document.getElementById('rabTable');
    const wb = XLSX.utils.table_to_book(table, { sheet: "RAB Proyek" });
    
    // Download file ke komputer / HP user
    XLSX.writeFile(wb, `RAB_${projectName.replace(/ /g, "_")}.xlsx`);
}

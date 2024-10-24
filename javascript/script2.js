document.getElementById('process-btn').addEventListener('click', function () {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    
    if (!file) {
        alert("Silakan pilih file Excel terlebih dahulu!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Konversi sheet ke dalam format JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Proses data sesuai dengan kriteria
        const processedData = processExcelData(jsonData);

        // Konversi kembali ke Excel dan siapkan untuk diunduh
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.aoa_to_sheet(processedData); // Menggunakan array of arrays untuk mempertahankan urutan
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');

        // Simpan sebagai file baru
        XLSX.writeFile(newWorkbook, 'Data Grup Sales Excel Final.xlsx');
    };

    reader.readAsArrayBuffer(file);
});

function processExcelData(data) {
    let sequentialNumber = 1; // untuk melacak nomor urut
    let inSequentialMode = false; // apakah sedang dalam mode sekuensial

    // Pastikan header tetap di tempat pertama
    const header = data[0];
    const processedData = [header]; // Simpan header

    for (let i = 1; i < data.length; i++) {
        const row = data[i];

        // Proses untuk kolom KeyID
        if (row[0] === 1) { // Kolom KeyID adalah yang pertama
            inSequentialMode = true;
            sequentialNumber = 2; // mulai dari 2 setelah menemukan 1
        } else if (inSequentialMode) {
            row[0] = sequentialNumber++; // Ubah nilai KeyID
            if (row[0] === 1) {
                inSequentialMode = false; // berhenti jika menemukan 1 lagi
            }
        }

        // Proses untuk kolom GROUPSEQ
        if (row[4] && row[4] !== '' && row[4] !== undefined) { // Cek jika GROUPSEQ terisi
            let j = i - 1; // mulai dari baris di atas
            while (j >= 0 && data[j][3].startsWith("--")) { // Cek ITEMOVDESC
                j--; // Naik ke baris di atas
            }
            // Jika ditemukan baris yang tidak diawali "--"
            if (j >= 0) {
                row[4] = data[j][0]; // Set GROUPSEQ sesuai dengan KeyID baris atas
            }
        }

        processedData.push(row); // Tambahkan baris yang telah diproses
    }

    return processedData; // Kembalikan data yang telah diproses
}

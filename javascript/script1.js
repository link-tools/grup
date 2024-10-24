function processFiles() {
    const instructionsFile = document.getElementById('instructionsInput').files[0];
    const dataFile = document.getElementById('fileInput').files[0];

    if (!instructionsFile || !dataFile) {
        alert('Please upload both the instructions file and the Excel file to process.');
        return;
    }

    // Read instructions file first
    readExcelFile(instructionsFile, function(instructionsData) {
        // Read the main data file
        readExcelFile(dataFile, function(data) {
            // Process the data according to instructions
            const updatedData = applyInstructions(data, instructionsData);

            // Export the modified data
            exportToExcel(updatedData);
        });
    });
}

function readExcelFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        callback(jsonData);
    };
    reader.readAsArrayBuffer(file);
}

function applyInstructions(data, instructions) {
    const insertMap = {};

    // Parse instructions to create a map of actions and item details
    for (let i = 1; i < instructions.length; i++) {
        const [itemNo, action, itemOVDesc, codeItem, quantity] = instructions[i];
        if (action === 'INSERT') {
            if (!insertMap[itemNo]) {
                insertMap[itemNo] = [];
            }
            insertMap[itemNo].push({ itemOVDesc, codeItem, quantity: parseFloat(quantity) });
        }
    }

    // Insert new rows based on instructions
    for (let i = data.length - 1; i >= 0; i--) {
        const itemNo = data[i][1]; // Assuming ITEMNO is in the second column
        const keyID = data[i][0]; // Assuming KeyID is in the first column
        const quantityA204 = parseFloat(data[i][2]); // Assuming QUANTITY is in the third column
        const invoiceNo = data[i][7]; // Assuming INVOICENO is in the eighth column
        const invoiceDate = data[i][8]; // Assuming INVOICEDATE is in the ninth column
        const shipDate = data[i][12]; // Assuming SHIPDATE is in the thirteenth column

        if (insertMap[itemNo]) {
            // Insert rows in reverse order to maintain indices
            insertMap[itemNo].forEach(({ itemOVDesc, codeItem, quantity }) => {
                const newQuantity = quantityA204 * quantity; // Multiply quantity
                data.splice(i + 1, 0, [
                    '',               // KeyID (empty)
                    codeItem,        // ITEMNO (from instructions file)
                    newQuantity,     // QUANTITY (calculated)
                    itemOVDesc,      // ITEMOVDESC (from instructions file)
                    keyID,           // GROUPSEQ (matches parent KeyID)
                    '',               // UNITPRICE (empty)
                    '',               // BRUTOUNITPRICE (empty)
                    invoiceNo,       // INVOICENO (from parent row)
                    invoiceDate,     // INVOICEDATE (from parent row)
                    '',               // CASHDISCOUNT (empty)
                    '',               // INVOICEAMOUNT (empty)
                    '',               // DESCRIPTION (empty)
                    shipDate         // SHIPDATE (from parent row)
                ]);
            });
        }
    }

    return data;
}

function exportToExcel(data) {
    const newWorksheet = XLSX.utils.aoa_to_sheet(data);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Data Grup Sales');
    const newFile = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });

    // Create download link
    const blob = new Blob([newFile], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    downloadLink.download = 'Data Grup Sales Excel.xlsx';
    downloadLink.style.display = 'block';
    downloadLink.textContent = 'Download Data Grup Sales Excel';
}

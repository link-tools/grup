function openTab(tabName) {
    // Mengambil semua elemen dengan kelas 'tab'
    const tabs = document.querySelectorAll('.tab');
    const buttons = document.querySelectorAll('.tab-button');

    // Menyembunyikan semua tab
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Menonaktifkan semua tombol tab
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // Menampilkan tab yang dipilih
    document.getElementById(tabName).classList.add('active');
    const activeButton = document.querySelector(`.tab-button[onclick="openTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

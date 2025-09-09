const startBtn = document.getElementById('start-btn');
const barcodeSpan = document.getElementById('barcode');

startBtn.addEventListener('click', () => {
    barcodeSpan.textContent = '';
    startBarcodeScanner();
});

function startBarcodeScanner() {
    // Configuração do QuaggaJS para usar a câmera traseira
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#camera-container'), // video será inserido aqui
            constraints: {
                facingMode: "environment" // câmera traseira
            }
        },
        decoder: {
            readers: [
                "code_128_reader",
                "ean_reader",
                "ean_8_reader",
                "upc_reader",
                "upc_e_reader"
            ]
        }
    }, function (err) {
        if (err) {
            alert("Erro ao acessar a câmera: " + err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function (data) {
        Quagga.stop();
        barcodeSpan.textContent = data.codeResult.code;
    });
}
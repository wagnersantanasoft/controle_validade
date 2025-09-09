const startBtn = document.getElementById('start-btn');
const barcodeSpan = document.getElementById('barcode');
const productInfoDiv = document.getElementById('product-info');
const notFoundDiv = document.getElementById('not-found');

// Campos de produto
const prodCodigo = document.getElementById('prod-codigo');
const prodEan = document.getElementById('prod-ean');
const prodNome = document.getElementById('prod-nome');
const prodValidade = document.getElementById('prod-validade');
const prodPreco = document.getElementById('prod-preco');

// Lista de produtos aleatórios para exemplo
const produtos = [
    {
        codigo: "1001",
        ean: "7891234567890",
        nome: "Sabonete Lux",
        validade: "2025-12-01",
        preco: 2.99
    },
    {
        codigo: "1002",
        ean: "7899876543210",
        nome: "Shampoo Dove",
        validade: "2026-06-15",
        preco: 14.90
    },
    {
        codigo: "1003",
        ean: "7891112223334",
        nome: "Creme Dental Colgate",
        validade: "2027-03-10",
        preco: 5.75
    },
    {
        codigo: "1004",
        ean: "7894445556667",
        nome: "Desodorante Rexona",
        validade: "2025-09-30",
        preco: 12.50
    },
    {
        codigo: "1005",
        ean: "7897778889991",
        nome: "Sabão em Pó OMO",
        validade: "2026-05-20",
        preco: 22.00
    }
];

startBtn.addEventListener('click', () => {
    barcodeSpan.textContent = '';
    productInfoDiv.classList.add('hidden');
    notFoundDiv.classList.add('hidden');
    startBarcodeScanner();
});

function startBarcodeScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#camera-container'),
            constraints: {
                facingMode: "environment"
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

    Quagga.onDetected(onBarcodeDetected);
}

function onBarcodeDetected(data) {
    Quagga.stop();
    let code = data.codeResult.code;
    barcodeSpan.textContent = code;

    // Procura produto pelo código ou EAN
    let produto = produtos.find(p => p.codigo === code || p.ean === code);

    if (produto) {
        prodCodigo.textContent = produto.codigo;
        prodEan.textContent = produto.ean;
        prodNome.textContent = produto.nome;
        prodValidade.textContent = produto.validade;
        prodPreco.textContent = produto.preco.toFixed(2);
        productInfoDiv.classList.remove('hidden');
        notFoundDiv.classList.add('hidden');
    } else {
        productInfoDiv.classList.add('hidden');
        notFoundDiv.classList.remove('hidden');
    }

    Quagga.offDetected(onBarcodeDetected);
}
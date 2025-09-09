const startBtn = document.getElementById('start-btn');
const barcodeSpan = document.getElementById('barcode');
const cameraContainer = document.getElementById('camera-container');
const productList = document.getElementById('product-list');

// Lista fixa de produtos para teste
const produtos = [
    {
        codigo: "001",
        codBarras: "7891196500817",
        nome: "Leite Integral Parmalat",
        validade: "2025-12-01",
        preco: 5.49
    },
    {
        codigo: "002",
        codBarras: "7891234567890",
        nome: "Biscoito Maria",
        validade: "2025-10-20",
        preco: 2.99
    },
    {
        codigo: "003",
        codBarras: "7899876543210",
        nome: "Café Pilão 500g",
        validade: "2026-06-15",
        preco: 16.90
    },
    {
        codigo: "004",
        codBarras: "7891112223334",
        nome: "Refrigerante Coca-Cola 2L",
        validade: "2025-09-30",
        preco: 8.50
    },
    {
        codigo: "005",
        codBarras: "7897778889991",
        nome: "Arroz Tio João 5kg",
        validade: "2026-05-20",
        preco: 25.00
    }
];

// Renderiza a lista de produtos
function renderProductList(highlightCode = null) {
    productList.innerHTML = '';
    produtos.forEach(prod => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${prod.nome}</strong><br>
            Código: ${prod.codigo}<br>
            Código de barras: ${prod.codBarras}<br>
            Validade: ${prod.validade}<br>
            Preço: R$ ${prod.preco.toFixed(2)}
        `;
        if (prod.codBarras === highlightCode) {
            li.classList.add('highlight');
        }
        productList.appendChild(li);
    });
}

// Inicializa lista no carregamento
renderProductList();

startBtn.addEventListener('click', () => {
    barcodeSpan.textContent = '';
    cameraContainer.style.display = 'block';
    renderProductList(); // Remove destaque anterior
    startBarcodeScanner();
});

function startBarcodeScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: cameraContainer,
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
            cameraContainer.style.display = 'none';
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(onBarcodeDetected);
}

function onBarcodeDetected(data) {
    Quagga.stop();
    cameraContainer.style.display = 'none';
    let code = data.codeResult.code;
    barcodeSpan.textContent = code;

    // Destaca o produto na lista pelo código de barras
    const encontrado = produtos.find(p => p.codBarras === code);
    if (encontrado) {
        renderProductList(code);
    } else {
        renderProductList();
        alert('Produto não localizado!');
    }

    Quagga.offDetected(onBarcodeDetected);
}
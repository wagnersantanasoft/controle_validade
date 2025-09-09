// --- Autenticação simples (demo, para evoluir depois) ---
const users = [
    { user: "admin", pass: "1234" }
];

function showSection(id) {
    ["loginSection", "dashboardSection", "cadastroSection"].forEach(sec => {
        document.getElementById(sec).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
}

document.getElementById("loginBtn").onclick = function() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();
    const found = users.find(u => u.user === user && u.pass === pass);
    if(found) {
        showSection("dashboardSection");
        document.getElementById("loginMsg").textContent = "";
        atualizarTabela();
        atualizarFiltros();
    } else {
        document.getElementById("loginMsg").textContent = "Usuário ou senha inválidos.";
    }
};
document.getElementById("logoutBtn").onclick = function() {
    showSection("loginSection");
    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";
};

// --- Produto e LocalStorage ---
function getProdutos() {
    return JSON.parse(localStorage.getItem("produtos") || "[]");
}
function setProdutos(arr) {
    localStorage.setItem("produtos", JSON.stringify(arr));
}
function addProduto(prod) {
    const arr = getProdutos();
    arr.push(prod);
    setProdutos(arr);
}
function removerProduto(ean, validade) {
    let arr = getProdutos();
    arr = arr.filter(p => !(p.ean === ean && p.validade === validade));
    setProdutos(arr);
}
function atualizarProduto(ean, validade, novo) {
    let arr = getProdutos();
    arr = arr.map(p => (p.ean === ean && p.validade === validade ? novo : p));
    setProdutos(arr);
}

// --- Atualização de filtros de grupo/marca ---
function atualizarFiltros() {
    const arr = getProdutos();
    const grupos = [...new Set(arr.map(p=>p.grupo).filter(Boolean))];
    const marcas = [...new Set(arr.map(p=>p.marca).filter(Boolean))];
    const grupoSel = document.getElementById("grupoFiltro");
    const marcaSel = document.getElementById("marcaFiltro");
    grupoSel.innerHTML = '<option value="">Todos</option>' + grupos.map(g=>`<option>${g}</option>`).join("");
    marcaSel.innerHTML = '<option value="">Todas</option>' + marcas.map(m=>`<option>${m}</option>`).join("");
}

// --- Tabela ---
function atualizarTabela(filtro={}) {
    const arr = getProdutos();
    let lista = arr.slice();
    // Filtros
    if(filtro.busca) {
        const b = filtro.busca.toLowerCase();
        lista = lista.filter(p =>
            p.ean.toLowerCase().includes(b) ||
            p.nome.toLowerCase().includes(b) ||
            p.grupo.toLowerCase().includes(b) ||
            p.marca.toLowerCase().includes(b)
        );
    }
    if(filtro.grupo) lista = lista.filter(p=>p.grupo===filtro.grupo);
    if(filtro.marca) lista = lista.filter(p=>p.marca===filtro.marca);
    if(filtro.vencido) {
        const hoje = new Date().toISOString().slice(0,10);
        lista = lista.filter(p=>p.validade < hoje);
    }
    if(filtro.proximo) {
        const hoje = new Date();
        const dias = filtro.dias || 7;
        lista = lista.filter(p=>{
            const v = new Date(p.validade);
            return v >= hoje && (v-hoje)/(1000*60*60*24) <= dias;
        });
    }
    // Tabela
    const tbody = document.querySelector("#produtosTable tbody");
    tbody.innerHTML = "";
    lista.forEach(p=>{
        const hoje = new Date();
        const v = new Date(p.validade);
        let classe = "";
        if(p.validade < hoje.toISOString().slice(0,10)) classe = "vencido";
        else if(v-hoje <= (1000*60*60*24)*(document.getElementById("diasFiltro").value || 7)) classe = "proximo";
        const tr = document.createElement("tr");
        tr.className = classe;
        tr.innerHTML = `
            <td>${p.ean}</td>
            <td>${p.nome}</td>
            <td>${p.grupo}</td>
            <td>${p.marca}</td>
            <td>${p.validade}</td>
            <td>${p.qtd}</td>
            <td>
                <button onclick="removerProduto('${p.ean}','${p.validade}');atualizarTabela();atualizarFiltros();" style="background:#ff4136;width:auto;padding:4px 8px;font-size:0.9em;">Remover</button>
                <button onclick="editarProduto('${p.ean}','${p.validade}')" style="background:#faad1d;width:auto;padding:4px 8px;font-size:0.9em;margin-left:6px;">Editar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById("dashboardMsg").textContent = lista.length===0 ? "Nenhum produto encontrado." : "";
}

// --- Filtros ---
document.getElementById("listarBtn").onclick = ()=>{
    document.getElementById("buscaFiltro").value = "";
    document.getElementById("grupoFiltro").value = "";
    document.getElementById("marcaFiltro").value = "";
    document.getElementById("diasFiltro").value = 7;
    atualizarTabela();
};
document.getElementById("buscaFiltro").oninput = ()=>{
    atualizarTabela({
        busca: document.getElementById("buscaFiltro").value,
        grupo: document.getElementById("grupoFiltro").value,
        marca: document.getElementById("marcaFiltro").value
    });
};
document.getElementById("grupoFiltro").onchange = ()=>{
    atualizarTabela({
        busca: document.getElementById("buscaFiltro").value,
        grupo: document.getElementById("grupoFiltro").value,
        marca: document.getElementById("marcaFiltro").value
    });
};
document.getElementById("marcaFiltro").onchange = ()=>{
    atualizarTabela({
        busca: document.getElementById("buscaFiltro").value,
        grupo: document.getElementById("grupoFiltro").value,
        marca: document.getElementById("marcaFiltro").value
    });
};
document.getElementById("filtrarProximosBtn").onclick = ()=>{
    atualizarTabela({
        proximo: true,
        dias: document.getElementById("diasFiltro").value
    });
};
document.getElementById("filtrarVencidosBtn").onclick = ()=>{
    atualizarTabela({vencido:true});
};

// --- Cadastro Produto ---
document.getElementById("addProdutoBtn").onclick = ()=>{
    showSection("cadastroSection");
    document.getElementById("produtoEAN").value = "";
    document.getElementById("produtoNome").value = "";
    document.getElementById("produtoGrupo").value = "";
    document.getElementById("produtoMarca").value = "";
    document.getElementById("produtoValidade").value = "";
    document.getElementById("produtoQtd").value = 1;
    document.getElementById("cadastroMsg").textContent = "";
    stopScanner();
    stopCamera();
};
document.getElementById("cancelarCadastroBtn").onclick = ()=>{
    showSection("dashboardSection");
    stopScanner();
    stopCamera();
};

// --- Barcode Scanner (mantendo seu código funcional) ---
const video = document.getElementById('video');
const iniciarBtn = document.getElementById('iniciarLeituraBtn');
const pararBtn = document.getElementById('pararLeituraBtn');
const codigoDiv = document.getElementById('codigo');
let scanning = false, stream = null;

function getConstraints() {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        return {
            video: {
                facingMode: { exact: "environment" },
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        };
    }
    return { video: { facingMode: "environment" } };
}

iniciarBtn.onclick = async function() {
    iniciarBtn.disabled = true;
    pararBtn.style.display = 'inline-block';
    codigoDiv.textContent = '';
    await startCamera();
    startScanner();
};
pararBtn.onclick = function() {
    stopScanner();
    stopCamera();
};
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia(getConstraints());
        video.srcObject = stream;
        await video.play();
    } catch (err) {
        alert("Erro ao acessar a câmera: " + err);
        iniciarBtn.disabled = false;
        pararBtn.style.display = 'none';
    }
}
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    video.srcObject = null;
}
function startScanner() {
    scanning = true;
    if (window.Quagga) {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: video,
                constraints: getConstraints().video
            },
            decoder: {
                readers: [
                    "ean_reader",
                    "ean_8_reader",
                    "upc_reader",
                    "upc_e_reader"
                ]
            },
            locate: true
        }, function(err) {
            if (err) {
                alert("Erro ao iniciar o Quagga: " + err);
                stopScanner();
                stopCamera();
                return;
            }
            Quagga.start();
        });
        Quagga.onDetected(onDetected);
    }
}
function onDetected(result) {
    if (scanning && result && result.codeResult && result.codeResult.code) {
        codigoDiv.textContent = "Código lido: " + result.codeResult.code;
        document.getElementById("produtoEAN").value = result.codeResult.code;
        stopScanner();
        stopCamera();
    }
}
function stopScanner() {
    scanning = false;
    try { Quagga.stop(); } catch (e) {}
    iniciarBtn.disabled = false;
    pararBtn.style.display = 'none';
    if (window.Quagga) Quagga.offDetected(onDetected);
}

// --- Salvar Produto ---
document.getElementById("salvarProdutoBtn").onclick = function() {
    const ean = document.getElementById("produtoEAN").value.trim();
    const nome = document.getElementById("produtoNome").value.trim();
    const grupo = document.getElementById("produtoGrupo").value.trim();
    const marca = document.getElementById("produtoMarca").value.trim();
    const validade = document.getElementById("produtoValidade").value;
    const qtd = parseInt(document.getElementById("produtoQtd").value) || 1;
    if(!ean || !nome || !grupo || !marca || !validade || !qtd) {
        document.getElementById("cadastroMsg").textContent = "Preencha todos os campos!";
        return;
    }
    addProduto({ean, nome, grupo, marca, validade, qtd});
    document.getElementById("cadastroMsg").textContent = "Produto cadastrado!";
    setTimeout(()=>{
        showSection("dashboardSection");
        atualizarTabela();
        atualizarFiltros();
        stopScanner();
        stopCamera();
    }, 700);
};

// --- Editar Produto ---
window.editarProduto = function(ean, validade) {
    const arr = getProdutos();
    const prod = arr.find(p=>p.ean===ean && p.validade===validade);
    if(!prod) return;
    showSection("cadastroSection");
    document.getElementById("produtoEAN").value = prod.ean;
    document.getElementById("produtoNome").value = prod.nome;
    document.getElementById("produtoGrupo").value = prod.grupo;
    document.getElementById("produtoMarca").value = prod.marca;
    document.getElementById("produtoValidade").value = prod.validade;
    document.getElementById("produtoQtd").value = prod.qtd;
    document.getElementById("cadastroMsg").textContent = "";
    stopScanner();
    stopCamera();
    document.getElementById("salvarProdutoBtn").onclick = function() {
        const nome = document.getElementById("produtoNome").value.trim();
        const grupo = document.getElementById("produtoGrupo").value.trim();
        const marca = document.getElementById("produtoMarca").value.trim();
        const novaValidade = document.getElementById("produtoValidade").value;
        const qtd = parseInt(document.getElementById("produtoQtd").value) || 1;
        if(!ean || !nome || !grupo || !marca || !novaValidade || !qtd) {
            document.getElementById("cadastroMsg").textContent = "Preencha todos os campos!";
            return;
        }
        atualizarProduto(ean, validade, {ean, nome, grupo, marca, validade: novaValidade, qtd});
        document.getElementById("cadastroMsg").textContent = "Produto atualizado!";
        setTimeout(()=>{
            showSection("dashboardSection");
            atualizarTabela();
            atualizarFiltros();
            stopScanner();
            stopCamera();
        }, 700);
    };
};

// --- Inicialização ---
showSection("loginSection");
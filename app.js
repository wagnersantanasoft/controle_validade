// ---------- Autenticação simples ----------
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
    document.getElementById("loginUser").value = "admin";
    document.getElementById("loginPass").value = "1234";
};

// ---------- Produtos (LocalStorage) ----------
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

// ---------- Produtos de TESTE ----------
function seedProdutosTeste() {
    if(getProdutos().length === 0) {
        setProdutos([
            {ean:"7891234567890",nome:"Leite Integral",grupo:"Laticínios",marca:"BoaVida",validade:"2025-09-15",qtd:10},
            {ean:"7899876543210",nome:"Iogurte Natural",grupo:"Laticínios",marca:"BoaVida",validade:"2025-09-11",qtd:5},
            {ean:"7891112223334",nome:"Pão de Forma",grupo:"Padaria",marca:"TrigoGold",validade:"2025-09-05",qtd:2},
            {ean:"7895556667778",nome:"Presunto Fatiado",grupo:"Frios",marca:"PorcoBom",validade:"2025-09-10",qtd:8},
            {ean:"7894445556667",nome:"Refrigerante Cola",grupo:"Bebidas",marca:"RefriX",validade:"2026-02-01",qtd:24}
        ]);
    }
}
seedProdutosTeste();

// ---------- Filtros grupo/marca preenchidos ----------
function atualizarFiltros() {
    const arr = getProdutos();
    const grupos = [...new Set(arr.map(p=>p.grupo).filter(Boolean))];
    const marcas = [...new Set(arr.map(p=>p.marca).filter(Boolean))];
    const grupoSel = document.getElementById("grupoFiltro");
    const marcaSel = document.getElementById("marcaFiltro");
    grupoSel.innerHTML = '<option value="">Todos</option>' + grupos.map(g=>`<option>${g}</option>`).join("");
    marcaSel.innerHTML = '<option value="">Todas</option>' + marcas.map(m=>`<option>${m}</option>`).join("");
}

// ---------- Tabela ----------
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
    if(filtro.eanBusca) {
        lista = lista.filter(p=>p.ean === filtro.eanBusca);
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
                <button onclick="removerProduto('${p.ean}','${p.validade}');atualizarTabela();atualizarFiltros();" style="background:#ff4136;width:auto;padding:4px 8px;font-size:0.95em;">Remover</button>
                <button onclick="editarProduto('${p.ean}','${p.validade}')" style="background:#faad1d;width:auto;padding:4px 8px;font-size:0.95em;margin-left:6px;">Editar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById("dashboardMsg").textContent = lista.length===0 ? "Nenhum produto encontrado." : "";
}

// ---------- Filtros ----------
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

// ---------- Busca por código de barras (foto + input manual) ----------
const buscarCodigoBtn = document.getElementById('buscarCodigoBtn');
const scannerBusca = document.getElementById('scannerBusca');
const videoBusca = document.getElementById('videoBusca');
const canvasBusca = document.getElementById('canvasBusca');
const capturarBuscaBtn = document.getElementById('capturarBuscaBtn');
const pararBuscaBtn = document.getElementById('pararBuscaBtn');
const fotoBuscaMsg = document.getElementById('fotoBuscaMsg');
const codigoBuscaInput = document.getElementById('codigoBuscaInput');
const buscarPorCodigoFinalBtn = document.getElementById('buscarPorCodigoFinalBtn');
let streamBusca = null;

buscarCodigoBtn.onclick = async function() {
    scannerBusca.classList.remove('hidden');
    fotoBuscaMsg.textContent = "";
    codigoBuscaInput.value = "";
    await startCameraBusca();
};
capturarBuscaBtn.onclick = function() {
    if (!streamBusca) return;
    canvasBusca.width = videoBusca.videoWidth;
    canvasBusca.height = videoBusca.videoHeight;
    canvasBusca.getContext('2d').drawImage(videoBusca, 0, 0, canvasBusca.width, canvasBusca.height);
    canvasBusca.style.display = 'block';
    fotoBuscaMsg.textContent = "Foto capturada! Digite o código manualmente.";
};
pararBuscaBtn.onclick = function() {
    stopCameraBusca();
    scannerBusca.classList.add('hidden');
};
buscarPorCodigoFinalBtn.onclick = function() {
    const ean = codigoBuscaInput.value.trim();
    if (!ean) {
        fotoBuscaMsg.textContent = "Digite o código!";
        return;
    }
    stopCameraBusca();
    scannerBusca.classList.add('hidden');
    atualizarTabela({eanBusca: ean});
};
async function startCameraBusca() {
    stopCameraBusca();
    try {
        streamBusca = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoBusca.srcObject = streamBusca;
        await videoBusca.play();
        canvasBusca.style.display = 'none';
    } catch (err) {
        fotoBuscaMsg.textContent = "Erro ao acessar câmera: " + err;
    }
}
function stopCameraBusca() {
    if (streamBusca) {
        streamBusca.getTracks().forEach(track => track.stop());
        streamBusca = null;
    }
    videoBusca.srcObject = null;
    canvasBusca.style.display = 'none';
}

// ---------- Cadastro Produto (foto + input manual) ----------
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const capturarBtn = document.getElementById('capturarBtn');
const pararLeituraBtn = document.getElementById('pararLeituraBtn');
const cameraMsg = document.getElementById('cameraMsg');
let stream = null;

document.getElementById("addProdutoBtn").onclick = async ()=>{
    showSection("cadastroSection");
    document.getElementById("produtoEAN").value = "";
    document.getElementById("produtoNome").value = "";
    document.getElementById("produtoGrupo").value = "";
    document.getElementById("produtoMarca").value = "";
    document.getElementById("produtoValidade").value = "";
    document.getElementById("produtoQtd").value = 1;
    document.getElementById("cadastroMsg").textContent = "";
    cameraMsg.textContent = "";
    await startCameraCadastro();
};
capturarBtn.onclick = function() {
    if (!stream) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block';
    cameraMsg.textContent = "Foto capturada! Digite o código manualmente.";
};
pararLeituraBtn.onclick = function() {
    stopCameraCadastro();
};
async function startCameraCadastro() {
    stopCameraCadastro();
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        await video.play();
        canvas.style.display = 'none';
    } catch (err) {
        cameraMsg.textContent = "Erro ao acessar câmera: " + err;
    }
}
function stopCameraCadastro() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    video.srcObject = null;
    canvas.style.display = 'none';
}
document.getElementById("cancelarCadastroBtn").onclick = ()=>{
    showSection("dashboardSection");
    stopCameraCadastro();
};

// ---------- Salvar Produto ----------
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
        stopCameraCadastro();
    }, 700);
};

// ---------- Editar Produto ----------
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
    cameraMsg.textContent = "";
    startCameraCadastro();
    canvas.style.display = 'none';
};

// ---------- Inicialização ----------
showSection("loginSection");
const path = require('path'); // Referenciando modulo path para trabalhar com diretorios
const jsdom = require('jsdom'); // Referenciando modulo jsdom para 'emular' funções do navegador em servidor
const express = require('express'); // Referenciando módulo express para funções de app web

const app = express(); // Criando instância em app
const server = require('http').Server(app); // Suplantando app para servidor http, para gerenciamento de requests http (GET, POST, etc)
const { JSDOM } = jsdom; // Criando instância de Jsdom

app.use(express.static(__dirname + '/public')); // Usando função middleware static de express para renderizar arquivos estáticos

// Diz ao servidor para 'servir' index.html como pagina root do server
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html'); 
});

function setupAuthoritativePhaser() {
    JSDOM.fromFile(path.join(__dirname, '/authoritative_server/index.html'), {
        // Para rodar scripts no arquivo html
        runScripts: 'dangerously',
        // Carregar recursos externos suportados
        resources: "usable",
        // Para que eventos requestAnimationFrame disparem
        pretendToBeVisual: true 
    }).then((dom) => { // Abrindo servidor para clientes após setup do mesmo
        dom.window.gameLoaded = () => { // Após Phaser ser carregado e inicializado
            server.listen(8081, function () {
                console.log(`Listening on ${server.address().port}`);
            });
        }
    }).catch((error) => {
        console.log(error.message);
    });
}

setupAuthoritativePhaser();
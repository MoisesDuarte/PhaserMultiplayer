const path = require('path'); // Referenciando modulo path para trabalhar com diretorios
const Datauri = require('datauri'); // Referenciando modulo datauri para utilizar metodo createObjectUrl em server
const jsdom = require('jsdom'); // Referenciando modulo jsdom para 'emular' funções do navegador em servidor
const express = require('express'); // Referenciando módulo express para funções de app web

const app = express(); // Instanciando express
const datauri = new Datauri(); // Instanciando datauri
const { JSDOM } = jsdom; // Instanciando jsdom
const server = require('http').Server(app); // Suplantando app para servidor http, para gerenciamento de requests http (GET, POST, etc)
const io = require('socket.io').listen(server); // Injetando socket.io em servidor para utilizar na comunicação cliente servidor

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
        // Criando metodo createObjectUrl, que ira formatar o blob com datauri no tipo de dado que podemos utilizar
        dom.window.URL.createObjectURL = (blob) => {
            if (blob) {
                return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
            }
        }

        // Criando metodo revokeObjectUrl
        dom.window.URL.revokeObjectURL = (objectURL) => {};

        dom.window.gameLoaded = () => { // Após Phaser ser carregado e inicializado
            server.listen(8081, function () {
                console.log(`Listening on ${server.address().port}`);
            });
            dom.window.io = io; // Injetando socket.io em jsdom
        }
    }).catch((error) => {
        console.log(error.message);
    });
}

setupAuthoritativePhaser();
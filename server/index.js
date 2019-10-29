const express = require('express'); // Referenciando módulo express
const app = express(); // Criando instância em app
const server = require('http').Server(app); // Suplantando app para servidor http, para gerenciamento de requests http (GET, POST, etc)

app.use(express.static(__dirname + '/public')); // Usando função middleware static de express para renderizar arquivos estáticos

// Diz ao servidor para 'servir' index.html como pagina root do server
app.get('/', function () {
    res.sendFile(__dirname + '/index.html'); 
});

// Server 'ouvindo' a port 8081
server.listen(8081, function () {
    console.log(`Listening on ${server.adress().port}`);
});
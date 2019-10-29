const config = {
    type: Phaser.HEADLESS,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {y: 0}
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    autoFocus: false
};

const players = {};

function preload() {
    this.load.image('player', 'assets/playerBlue.png');
}

function create() {
    const self = this; // Variavel self usadap para guardar uma referencia ao Phaser Scene

    this.players = this.physics.add.group();

    // 'Ouvindo' chamadas de conexões no servidor
    io.on('connection', function (socket) {
        console.log('Jogador conectou');

        // Cria um novo jogador e adiciona ao grupo de jogadores
        players[socket.id] = {
            rotation: 0,
            x: Math.floor(Math.random() * 700) + 50,
            y: Math.floor(Math.random() * 500) + 50,
            playerId: socket.id, // Para referenciar no jogo, caso necessario
            team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue' // Define o time do jogador
        };

        // Adiciona jogador ao servidor
        addPlayer(self, players[socket.id]);

        // Envia o objeto de jogadores para o novo jogador (server -> client) (emit envia para o socket/jogador referente a sessão)
        socket.emit('currentPlayers', players);

        // Atualiza todos os outros jogadores do novo jogador (server -> client) (broadcast envia para todos os sockets/jogadores)
        socket.broadcast.emit('newPlayer', players[socket.id]);

        socket.on('disconnect', function() {
            console.log('Jogador desconectou');

            // Remove jogador do servidor
            removePlayer(self, socket.id);

            // Remove jogador do grupo de jogadores
            delete players[socket.id];

            // Envia uma mensagem para todos os jogadores removerem esse jogador
            io.emit('disconnect', socket.id);

        });
    });
}

function update() {

}

// Game functions
function addPlayer(self, playerInfo) {
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'player')
        .setOrigin(0.5, 0.5) // setOrigin(0.5, .05) define o ponto de ancora no meio do sprite
        .setDisplaySize(53,40); // setDisplaySize() muda a escala do objeto
    
    // Configurações de física
    player.setDrag(100);
    player.setAngularDrag(100);
    player.setMaxVelocity(200);

    player.playerId = playerInfo.playerId;
    self.players.add(player);
}

function removePlayer(self, playerId) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            player.destroy();
        }
    });
}

const game = new Phaser.Game(config);
window.gameLoaded();
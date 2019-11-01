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
    this.load.image('player', 'assets/player.png');
}

function create() {
    var self = this; // Variavel guarda uma referencia ao Phaser Scene
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
            team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue', // Define o time do jogador
            input: {
                left: false,
                right: false,
                up: false
            }
        };

        // Adiciona jogador ao servidor
        addPlayer(self, players[socket.id]);

        // Envia o objeto de jogadores para o novo jogador (server -> client) (emit envia para o socket/jogador referente a sessão)
        socket.emit('currentPlayers', players);

        // Atualiza todos os outros jogadores quanto ao novo jogador (server -> client) (broadcast envia para todos os sockets/jogadores)
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

        // Quando um jogador se mover, atualiza os dados do jogador
        socket.on('playerInput', function (inputData) {
            handlePlayerInput(self, socket.id, inputData);
        })
    });
}

function update() {
    // Move todos jogadores do servidor de acordo com o estado do input de cada um
    this.players.getChildren().forEach((player) => {
        const input = players[player.playerId].input;
        if (input.left) {
            player.setAngularVelocity(-300);
        } else if (input.right) {
            player.setAngularVelocity(300);
        } else {
            player.setAngularVelocity(0);
        }

        if (input.up) {
            this.physics.velocityFromRotation(player.rotation + 1.5, 200, player.body.acceleration);
        } else {
            player.setAcceleration(0);
        }

        // Guardando propriedades do player object (Referentes ao phaser, x, y e rotation) em nosso objeto players
        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
        players[player.playerId].rotation = player.rotation
    });

    this.physics.world.wrap(this.players, 5); // Quando jogador sair da tela, surgirá do outro lado
    io.emit('playerUpdates', players); // Envia os updates para o jogador (server->client)
}

// GAME FUNCTIONS
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

// Checa input do jogador e guarda em seu objeto para uso
function handlePlayerInput(self, playerId, input) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) { // Checa se o id do objeto coincide com o id do socket do jogador
            players[player.playerId].input = input; // Guarda o input do jogador
        }
    });
}

const game = new Phaser.Game(config);
window.gameLoaded();
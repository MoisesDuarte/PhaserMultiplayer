var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('scoreboard', 'assets/scoreboard.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('otherPlayer', 'assets/otherPlayer.png');
    this.load.image('star', 'assets/star_gold.png');
}

function create() {
    var self = this; // Referenciando Phaser Scene
    this.socket = io(); // Referenciado socket.io
    this.players = this.add.group();

    const scoreboard = this.add.image(7, 7, 'scoreboard')
                        .setOrigin(0, 0);

    // Texto da pontuação
    this.blueScoreText = this.add.text(161, 3, '', { fontFamily: 'monogram', fontSize: '32px', fill: '#e1ad56' });
    this.redScoreText = this.add.text(161, 31, '', { fontFamily: 'monogram', fontSize: '32px', fill: '#e1ad56' });

    // Lendo evento currentPlayer emitido pelo servidor
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) { // Cria um array de todos as chaves em players e loop
            if (players[id].playerId === self.socket.id) { // Loop entre todos jogadores para checar se jogador esta incluso no grupo
                displayPlayers(self, players[id], 'player');
            } else {
                displayPlayers(self, players[id], 'otherPlayer');
            }
        });
    });

    // Apresenta novo jogador no servidor
    this.socket.on('newPlayer', function(playerInfo) {
        displayPlayers(self, playerInfo, 'otherPlayer');
    });

    // Apaga jogador do grupo ao desconectar do jogo
    this.socket.on('disconnect', function (playerId) {
        self.players.getChildren().forEach(function (player) {
            if (playerId === player.playerId) {
                player.destroy();
            }
        });
    });

    // Atualiza as coordenadas do jogador com movimento feito no servidor
    this.socket.on('playerUpdates', function (players) {
        Object.keys(players).forEach(function (id) { // loop pelo objeto players mandado pelo servidor
            self.players.getChildren().forEach(function (player) { // loop pelo objeto players local
                if (players[id].playerId === player.playerId) {
                    player.setRotation(players[id].rotation);
                    player.setPosition(players[id].x, players[id].y);
                }
            });
        });
    });

    // Atualiza pontuação
    this.socket.on('updateScore', function (scores) {
        self.blueScoreText.setText(scores.blue);
        self.redScoreText.setText(scores.red);
    });

    // Atualiza posição da estrela
    this.socket.on('starLocation', function (starLocation) {
        // Checa se estrela já existe
        if (!self.star) { 
            self.star = self.add.image(starLocation.x, starLocation.y, 'star');
        } else {
            self.star.setPosition(starLocation.x, starLocation.y);
        }
    });

    // Lendo input do teclado
    this.cursors = this.input.keyboard.createCursorKeys();
    this.leftKeyPressed = false;
    this.rightKeyPressed = false;
    this.upKeyPressed = false;
}

function update() {
    const left = this.leftKeyPressed;
    const right = this.rightKeyPressed;
    const up = this.upKeyPressed;

    // Rotação
    if (this.cursors.left.isDown) {
        this.leftKeyPressed = true;
    } else if (this.cursors.right.isDown) {
        this.rightKeyPressed = true;
    } else {
        this.leftKeyPressed = false;
        this.rightKeyPressed = false;
    }

    // Aceleração
    if (this.cursors.up.isDown) {
        this.upKeyPressed = true;
    } else {
        this.upKeyPressed = false;
    }

    // Enviando input para servidor
    if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed) {
        this.socket.emit('playerInput', { left: this.leftKeyPressed, right: this.rightKeyPressed, up: this.upKeyPressed });
    }
}

// Game functions
function displayPlayers(self, playerInfo, sprite) {
    const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40);

    // Checa time do jogador e tinge sprite
    if (playerInfo.team === 'blue') player.setTint(0x0000ff);
    else player.setTint(0xff0000);

    player.playerId = playerInfo.playerId;
    self.players.add(player); // Adiciona player ao grupo local de players
}
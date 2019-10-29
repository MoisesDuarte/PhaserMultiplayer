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
    this.load.image('player', 'assets/player.png');
    this.load.image('otherPlayer', 'assets/otherPlayer.png');
}

function create() {
    var self = this; // Referenciando Phaser Scene
    this.socket = io();
    this.players = this.add.group();

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
}

function update() {

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
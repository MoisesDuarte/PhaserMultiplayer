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

const game = new Phaser.Game(config);

function preload() {

}

function create() {
    // 'Ouvindo' chamadas de conexões no servidor
    io.on('connection', function (socket) {
        console.log('Jogador conectou');
        socket.on('disconnect', function() {
            console.log('Jogador desconectou');
        });
    });
}

function update() {

}

window.gameLoaded();
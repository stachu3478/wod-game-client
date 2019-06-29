class PlayerManager {
    constructor () {
        this.players = {};
    }

    add (player) {
        this.players[player.id] = player;
    }

    clear() {
        this.players = {};
    }

    get me () {

    }
}
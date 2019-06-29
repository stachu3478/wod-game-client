import socket from '../../components/client'

import './style.scss'

class Highscores {
    constructor (element) {
        this.element = element;
        socket.on('highScores', function(evt) {
            highScores = evt;
        });
    }

    /** 
     * Shortcut to hide highscores {@link Highscores#off off} or {@link Highscores#on on}
     * @param {bool} bool - On (true) / off (false) switch 
    */
    setOn (bool) {
        if (bool) this.on()
        else this.off()
    }

    /**
     * Used to show highscores.
     */
    on () {
        if (this.isOn) return
        this.isOn = true

        this.element.classList.remove('hidden')
        socket.on('msg', this.receive);
    }

    /**
     * Used to hide highscores.
     */
    off () {
        if (!this.isOn) return
        this.isOn = false

        this.element.classList.add('hidden')
        socket.off('msg', this.receive);
    }

    /**
     * Will update highscores while called
     * @param {Array} highscores 
     */
    receive (highscores) {

    }
}
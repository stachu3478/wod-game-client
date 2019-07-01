import socket from '../../components/client'

import './style.scss'

/**
 * The event that represents a high score record placed in the highscore table received from the server.
 * @namespace HighScoreRecord
 */

/**
 * The amount of points that the given player currently has.
 * @member score
 * @memberof HighScoreRecord
 */

/**
 * Name of the player that has a score bind.
 * @member name
 * @memberof HighScoreRecord
 */

/**
 * Class to update and display hi-score board in the game.
 */
class Highscores {
    /**
     * Creates an highscore table from unordered list element.
     * @param {HTMLElement} element - Element to convert into highscore table.
     * @param {Boolean} autoOn - Switch to 
     */
    constructor (element, autoOn = false) {
        /** 
         * The root highscore table element. 
         * Note that element will show only if the instance has received any data ({@link Highscores#receive}).
        */
        this.element = element
        /** Boolean to detect if the instance has received any data ever. */
        this.anyReceived = false
        /** Property that tells the highscores are shown or not. */
        this.isOn = autoOn
        this.setOn(this.isOn)

        this.element.classList.add('hidden')
        /** HTMLUListElement that holds all hi-score records directly. */
        this.scoreList = document.createElement('table')
        this.element.appendChild(this.scoreList)
        this.receive = this.receive.bind(this)
    }

    /** 
     * Shortcut to turn highscores {@link Highscores#off off} or {@link Highscores#on on}.
     * @param {bool} bool - On (true) / off (false) switch.
    */
    setOn (bool) {
        if (bool) this.on()
        else this.off()
    }

    /**
     * Used to show highscores.
     * Note that element will show only if the instance has received any data ({@link Highscores#receive}).
     */
    on () {
        if (this.isOn) return
        this.isOn = true

        if (this.anyReceived) this.element.classList.remove('hidden')
        socket.on('highScores', this.receive);
    }

    /**
     * Used to hide highscores.
     */
    off () {
        if (!this.isOn) return
        this.isOn = false

        this.element.classList.add('hidden')
        socket.off('highScores', this.receive);
    }

    /**
     * Will update highscores while called.
     * @param {HighScoreRecord[]} highScores - Highscore list received from the server.
     * Note that server sends this message proportionally rare, about 1-2 per minute and only if it has changed.
     */
    receive (highScores) {
        this.scoreList.innerHTML = "";
        for (let i = 0; i < highScores.length; i++) {
            const counterElement = document.createElement('tr')
            const listElement = document.createElement('tr')
            const playerElement = document.createElement('td')
            counterElement.innerText = (i + 1) + '. '
            playerElement.innerText = (highScores[i].name || 'A nameless commander') + ':'
            const scoreElement = document.createElement('td')
            scoreElement.innerText = highScores[i].score.toString()
            listElement.appendChild(counterElement)
            listElement.appendChild(playerElement)
            listElement.appendChild(scoreElement)
            this.scoreList.appendChild(listElement)
        }

        if (!this.anyReceived) {
            this.anyReceived = true
            if (this.isOn) this.element.classList.remove('hidden')
        }
        console.log('got highscores')
    }
}

export default Highscores
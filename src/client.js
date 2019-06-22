import io from 'socket.io-client'

class Client {
    constructor (url, element) {
        element.innerText += '\nConnecting to server...'
        this.socket = new io(url)
        this.socket.on('connect', () => {
            element.innerText += '\nConnected to the server!'
        })
        this.socket.on('disconnection', () => {
            element.innerText += '\nDisconnected to the server!'
        })
        this.socket.on('error', () => {
            element.innerText += '\nGot error message from the server!'
        })
    }
}

export default Client
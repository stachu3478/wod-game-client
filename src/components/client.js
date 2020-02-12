import io from 'socket.io-client'

const devMode = window.location.hostname.match('localhost')
const url = devMode ? 'localhost:25565' : 'http://wodgame.herokuapp.com'
const socket = new io(url);

export default socket
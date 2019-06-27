import io from 'socket.io-client'

const socket = new io('http://wodgame.herokuapp.com');

export default socket
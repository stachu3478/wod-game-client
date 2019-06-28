import io from 'socket.io-client'

/** @inheritdoc */
const socket = new io('http://wodgame.herokuapp.com');

export default socket
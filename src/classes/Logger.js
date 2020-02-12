import socket from '../components/client'

import Mixer from './Mixer'

/**
 * Function to be triggered while play button is pressed or called by tryLogin.
 * {@link tryLogin} forces password use so makes user logged if it is correct.
 * @param {HTMLInputEvent} evt - input event of pressed button
 * @param {Boolean} login - switch to use password or no
 */
function play (evt, login) {
	socket.emit("login", {
		u: this.loginInput.value, 
		p: login && this.passwordInput.value
	});
	this.loginNotice.innerText = 'Connecting';
}

/**
 * Sends information about registering new user to server.
 * Takes all the data from inputs bind to instance.
 * @param {HTMLInputEvent} evt - event triggered by pressing button 
 */
function register (evt) {
	const ob = {
		u: this.regLoginInput.value, // username input
		p: this.regPasswordInput.value, // password input
		e: this.emailInput.value, // email input
	};
	socket.emit("register", ob);
	this.registerNotice.innerText = "Waiting for response..."
}

/**
 * Allows typing password if requested for login (password input is invisible by default).
 * If it is displayed then forces {@link play} function to send password.
 * @param {*} evt 
 */
function tryLogin (evt) {
	if (this.passwordInput.classList.contains('hidden')) this.passwordInput.classList.remove('hidden')
	else this.play(evt, true);
}; //login

/**
 * Manages logging and player registering logic.
 */
class Logger extends Mixer {
	/**
	 * Creates instance of Logger, binds triggers to given elements and plain functions to instance
	 * @param {Object} props - HTMLElements used as triggers, inputs and outputs for management
	 */
	constructor ( props ) {
		super(props)

		/** Play function is used instead of logging without a password, player is treated as guest */
		this.play = play.bind(this)
		/** Bind button for direct playing */
		this.playButton.addEventListener('click', this.play)
		/** Bind button for registering */
		this.registerButton.addEventListener('click', register.bind(this))
		/** Bind button for logging */
		this.loginButton.addEventListener('click', tryLogin.bind(this))
	}
}

export default Logger
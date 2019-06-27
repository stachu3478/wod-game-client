import socket from './components/client'

function register (evt) {
	const ob = {
		u: document.getElementById("username_reg").value, // username input
		p: document.getElementById("password_reg1").value, // password input
		e: document.getElementById("email").value, // email input
	};
    socket.emit("register", ob);
}
document.getElementById('regbtn').addEventListener('click', register)
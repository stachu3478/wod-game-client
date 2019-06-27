import socket from './client'

import { getXY } from './miscs'

const cssClasses = [
    "chat_guest",
    "chat_member",
    "chat_admin",
];

const prefixes = [
    "[G]",  // Guest
    "[M]",  // Member
    "[HA]", // HeadAdmin
]

const social = [
    'msg',      // global message
    'private',  // private from
    'bprivate'  // private to
]

const upKeys = {'ArrowUp': 1, 'Up': 1}
const downKeys = {'ArrowDown': 1, 'Down': 1}

const cmdPrefix = "/";

const teams = [{}]; // TODO team import

class Chat {
    constructor (chatElement, chatInput, messageList) {
        this.element = chatElement;
        this.input = chatInput;
        this.msgList = messageList;

        this.history = [];
        this.historyPos = 0;
        this.hiCache = "";
        this.isOn = false;

        this.chatting = false;
        this.input.addEventListener('focus', this.inputFocus)
        this.input.addEventListener('blur', this.inputBlur)
        this.input.addEventListener('keydown', this.inputKeyDown)
        this.input.onblur = function() {
            chatting = false;
        };
        this.input.onkeypress = function(evt) {
            if(evt.key === "Enter"){
                var val = input.value;
                if(val[0] === cmdPrefix){
                    chat.sendCmd(val.slice(1));
                }else{
                    chat.send(val);
                }
                input.value = "";
            }
        };
    }

    setOn (bool) {
        if (bool) this.on()
        else this.off()
    }

    on () {
        if (this.isOn) return
        this.isOn = true

        this.element.classList.remove('hidden')
        socket.on('msg', this.receive);
    }

    off () {
        if (!this.isOn) return
        this.isOn = false

        this.element.classList.add('hidden')
        socket.off('msg', this.receive);
    }

    inputFocus () {
        this.chatting = true;
    }

    inputBlur () {
        this.chatting = false;
    }

    inputKeyDown (evt) {
        if (evt.key === "Enter") {
            var val = this.input.value;
            if (val[0] === cmdPrefix) {
                this.sendCmd(val.slice(1));
            } else {
                this.send(val);
            }
            this.input.value = "";
        } else if (this.chatting) {
            if (evt.key in upKeys) this.up(evt);
            if (evt.key in downKeys) this.down(evt);
        }
    };

    up (evt) {
	    if (this.historyPos > 0) {
	        if (this.history.length === this.historyPos) this.hiCache = input.value || "";
	        this.input.value = this.history[--this.historyPos];
	        evt.preventDefault()
        }
    }

    down (evt) {
	    if (this.history.length >= this.historyPos) {
	        if (this.history.length === this.historyPos) {
	            this.input.value = this.hiCache;
	            this.historyPos++;
	        } else this.input.value = this.history[++this.historyPos];
	        evt.preventDefault();
        }
    }

	send (msg) {
		
		if (msg === '') return false;
		const hl = this.history.length - 1;
		if (this.history[hl] !== msg) {
			this.history.push(msg);
			this.historyPos = hl + 2;
		} else this.historyPos = hl + 1;
		this.input.blur();
		return socket.emit("msg", msg);
    }
    
	sendCmd (msg) {
		
		const hl = this.history.length - 1;
		const m = cmdPrefix + msg;
		if( this.history[this.history.length] !== m) {
			this.history.push(m);
			this.historyPos = hl + 2;
		} else this.historyPos = hl + 1;
		input.blur();
		return socket.emit("cmd", msg);
    }
    
	receive (evt) {
		
		const el = document.createElement("li");
		const rId = evt.rank;
		let username;
		if (social.indexOf(evt.type) !== -1) username = teams[evt.id].u || 'Guest ' + ((Math.abs(getXY(evt.id, 0) % 1) * 100) << 0);
		switch (evt.type) {
            case "msg":{
                el.className = cssClasses[rId];
                el.innerText = prefixes[rId] + username + ": " + evt.msg;
            }break;
            case "server": {
                el.className = "chat_server";
                el.innerText = "[SERVER] " + evt.msg;
            }break;
            case "console": {
                el.className = "chat_console";
                el.innerText = evt.msg;
            }break;
            case "private": {
                el.className = "chat_private";
                el.innerText = "From: " + prefixes[rId] + username + ": " + evt.msg;
            }break;
            case "bprivate": {
                el.className = "chat_private";
                el.innerText = "To: " + prefixes[rId] + username + ": " + evt.msg;
            }
        }
		this.msgList.appendChild(el);
		this.msgList.scrollTop = msgs.scrollHeight;
    }
    
    clear () {
        this.msgList.innerHTML = "";
    }
}

export default Chat;
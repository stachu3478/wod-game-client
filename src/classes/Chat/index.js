import socket from '../../components/client'

import { getXY } from '../../components/miscs'

import './style.scss'

/**
 * The event that represents chat message received from the server.
 * @namespace ChatMessageEvent
 */

/**
 * The message senders id.
 * If the sender is not a user it uses a reduntant command caller's id.
 * @member id
 * @memberof ChatMessageEvent
 */

/**
 * The sender's rank. It further refers to {@link cssClasses} or {@link prefixes}.
 * Possible values:
 * 1 - Guest - non-registered player 
 * 2 - Member - registered player
 * 3 - HeadAdmin - the server's op 
 * @member rank
 * @memberof ChatMessageEvent
 */

/**
 * Type of the message (console, server, msg, private).
 * @member type
 * @memberof ChatMessageEvent
 */

/**
 * The received message
 * @member msg
 * @memberof ChatMessageEvent
 */

 /** @module Chat */

/**
 * Classes that represent the style of single chat messages per player's rank.
 */
const cssClasses = [
    "chat_guest",
    "chat_member",
    "chat_admin",
];

/**
 * Prefixes that are placed in the message container before the name of the player
 * depending on his rank
 */
const prefixes = [
    "[G]",
    "[M]",
    "[HA]",
]

/**
 * Social constants that are used to detect if the chat message has benn sent
 * by the player
 */
const social = [
    /** Global message */
    'msg',
    /** Private message received from another player */
    'private',
    /** Private message sent to other player */
    'bprivate'
]

/**
 * Used to detect, if up arrow has been pressed
 */
const upKeys = {'ArrowUp': 1, 'Up': 1}
/**
 * Used to detect, if down arrow has been pressed
 */
const downKeys = {'ArrowDown': 1, 'Down': 1}

/**
 * Prefix that is used to detect, if the typed text is a command.
 */
const cmdPrefix = "/";

/**
 * All visible players list.
 * @todo - A team list needs to be imported to get the message sender's username
 */
const teams = [{}];

/**
 * Chat that implements communicating between players
 * and sending commands to the server
 * @author Stan Players
 */
class Chat {
    /**
     * Creates an instance of Chat and binds chat use cases events
     * @param {HTMLElement} chatElement - {@link Chat#element}
     * @param {HTMLInputElement} chatInput - {@link Chat#input}
     * @param {HTMLElement} messageList - {@link Chat#msgList}
     */
    constructor (chatElement, chatInput, messageList) {
        /** The root chat element that is used to hide chat on request */
        this.element = chatElement
        this.element.classList.add('chat')
        /** The input used to type messages and commands */
        this.input = chatInput;
        /** The list that displays chat messages */
        this.msgList = messageList;
        this.msgList.classList.add('chat-outer')
        
        /** The history that keeps all messages sent by the player */
        this.history = [];
        /** 
         * The cursor of {@link Chat#history} that represents currently displayed message at {@link Chat#input}.
         * The next message is displayd when the variable is equal to length of the chat history
        */
        this.historyPos = 0;
        /** The single message storage used to store the currently typed message while viewing chat history */
        this.hiCache = "";
        /** Used to detect, if the chat is showed */
        this.isOn = false;
        /** Used to detect, if the player is typping */
        this.chatting = false;

        this.input.addEventListener('focus', this.inputFocus.bind(this))
        this.input.addEventListener('blur', this.inputBlur.bind(this))
        this.input.addEventListener('keydown', this.inputKeyDown.bind(this))
        this.receive = this.receive.bind(this);
    }

    /** 
     * Shortcut to turn chat {@link Chat#off off} or {@link Chat#on on}
     * @param {bool} bool - On (true) / off (false) switch 
    */
    setOn (bool) {
        if (bool) this.on()
        else this.off()
    }

    /**
     * Used to turn chat on.
     */
    on () {
        /** Fall back while already on */
        if (this.isOn) return
        this.isOn = true

        /** The chat will show */
        this.element.classList.remove('hidden')
        /** The chat will start listening for messages. */
        socket.on('msg', this.receive);
    }

    /**
     * Used to turn chat off.
     */
    off () {
        /** Fall back while already off */
        if (!this.isOn) return
        this.isOn = false

        /** The chat will hide */
        this.element.classList.add('hidden')
        /** The chat will stop listening for messages. */
        socket.off('msg', this.receive);
    }

    /** Event listener which call means that the player has started typing a message */
    inputFocus () {
        this.chatting = true
        this.msgList.classList.remove('chat-outer')
        this.msgList.classList.add('chat-typing')
    }

    /** Event listener which call means that the player has stopped typing a message */
    inputBlur () {
        this.chatting = false
        this.msgList.classList.add('chat-outer')
        this.msgList.classList.remove('chat-typing')
        this.msgList.scrollTop = this.msgList.scrollHeight;
    }

    /** 
     * Used to send message (or command) if the player has pressed Enter 
     * or switch between history if the player has pressed arrows (up/down)
     * @param {KeyboardEvent} evt - instance of pressed key
     */
    inputKeyDown (evt) {
        if (evt.key === "Enter") {
            const val = this.input.value;
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

    /**
     * Used to switch to older message sent by the player
     * @param {KeyboardEvent} evt - instance of pressed key
     */
    up (evt) {
	    if (this.historyPos > 0) {
            /** Save draft message to {@link Chat#hiCache}, if it presents */
	        if (this.history.length === this.historyPos) this.hiCache = input.value || "";
	        this.input.value = this.history[--this.historyPos];
	        evt.preventDefault()
        }
    }

    /**
     * Used to switch to newer message sent by the player
     * @param {KeyboardEvent} evt - instance of pressed key
     */
    down (evt) {
	    if (this.history.length >= this.historyPos) {
            /** Restore draft message from {@link Chat#hiCache}, if there is no newer history */
	        if (this.history.length === this.historyPos) {
	            this.input.value = this.hiCache;
	            this.historyPos++;
	        } else this.input.value = this.history[++this.historyPos];
	        evt.preventDefault();
        }
    }

    /**
     * Sends message to the server through socket
     * @param {String} msg - message to be sent
     */
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
    
    /**
     * Sends command to the server through socket
     * @param {String} msg - Command to be sent (without {@link cmdPrefix command prefix})
     */
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
    
    /**
     * Socket event callback middleware to show and style received chat or server message
     * @param {ChatMessageEvent} evt - Object containing message information
     */
	receive ({id, type, rank, msg}) {
		
		const el = document.createElement("li");
		let username;
		if (social.indexOf(type) !== -1) username = (teams[id] && teams[id].u) || 'Guest ' + ((Math.abs(getXY(id, 0) % 1) * 100) << 0);
		switch (type) {
            case "msg":{
                el.className = cssClasses[rank];
                el.innerText = prefixes[rank] + username + ": " + msg;
            }break;
            case "server": {
                el.className = "chat_server";
                el.innerText = "[SERVER] " + msg;
            }break;
            case "console": {
                el.className = "chat_console";
                el.innerText = msg;
            }break;
            case "private": {
                el.className = "chat_private";
                el.innerText = "From: " + prefixes[rank] + username + ": " + msg;
            }break;
            case "bprivate": {
                el.className = "chat_private";
                el.innerText = "To: " + prefixes[rank] + username + ": " + msg;
            }
        }
		this.msgList.appendChild(el);
		this.msgList.scrollTop = this.msgList.scrollHeight;
    }
    
    /**
     * Clears {@link Chat#msgList chat message list}
     */
    clear () {
        this.msgList.innerHTML = "";
    }
}

export default Chat;
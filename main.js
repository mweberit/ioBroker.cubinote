"use strict";

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");
var adapter = utils.adapter('cubinote);
const request = require('request');

class Cubinote extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "cubinote",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		this.log.info("config AppId: " + this.config.AppId);
		this.log.info("config AccessKey: " + this.config.AccessKey);
		this.log.info("config DeviceId: " + this.config.DeviceId);
		this.log.info("config BindId: " + this.config.BindId);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		await this.setObjectNotExistsAsync("printMessage", {
			type: "state",
			common: {
			        name: "message to print",
			        type: "string",
			        role: "state",
			        read: true,
			        write: true,
			},
			native: {},
		});

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		this.subscribeStates("printMessage");
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates("lights.*");
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates("*");

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		//await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		//await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		//await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		//let result = await this.checkPasswordAsync("admin", "iobroker");
		//this.log.info("check user admin pw iobroker: " + result);

		//result = await this.checkGroupAsync("admin", "admin");
		//this.log.info("check group user admin group admin: " + result);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		if (state.val != "" && id.endsWith(".printMessage")) {
			var print = state.val;
			var timestamp = new Date(Date.now()).toISOString().replace('T', ' ').substring(0, 20); // 2021-02-23%2019:43:56
var url = 'http://api.cubinote.com/home/printpaper' +
'?appID=' + this.config.AppId + 
'&ak=' + this.config.AccessKey + 
'&timestamp=' + timestamp + 
'&deviceID=' + this.config.DeviceId + 
'&bindID=' + this.config.BindId +
'&printcontent=T:';

print = print.replaceAll('Ä', 'Ae');
print = print.replaceAll('ä', 'ae');
print = print.replaceAll('Ö', 'Oe');
print = print.replaceAll('ö', 'oe');
print = print.replaceAll('Ü', 'Ue');
print = print.replaceAll('ü', 'ue');
print = print.replaceAll('ß', 'ss');
			
print = WordWrap(print, 32);

var base64 = new Buffer(print).toString('base64');
			this.log.info(url + base64);	
request({url:url + base64},
    function (error, response, body) {
	    adapter.log.info(body);	
				        //log('1. request');
				        //log('error: ' + error);
				        //log('response: ' + JSON.stringify(response));
				        //log('body: ' + body);
    })

			
			}
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Cubinote(options);
} else {
	// otherwise start the instance directly
	new Cubinote();
}

function WordWrap(text, max) {

var lines = text.split('\n');

text = '';


lines.forEach(function(line) {

while (line.length > max) {

var lio = line.substring(0, max + 1).lastIndexOf(' ');

if (lio > 0) {

text = text + line.substring(0, lio) + '\n'

line = line.substring(lio + 1);

} else {

text = text + line.substring(0, max) + '\n'

line = line.substring(max + 1);

}

}

text = text + line + '\n';

});


return text;

}


const signals = [];
let debugMode = false;
const subscriptions = {"LOADED":[], "READ":[]};
let subscriptionCount = 0;
const whitelist = ["LOADED", "READ"];

const subscribe = (signal = null, callback = null, retroactive = false) => {
	//step 1a: validate signal against whitelist
	const signalIsValid = validate(signal);
	if (!signalIsValid){
		return false;
	}
	//step 1b: validate callback is of type function
	if (typeof(callback) !== "function"){
		return false;
	}
	//step 1c: return false if validation fails
	if (typeof(retroactive) !== "boolean"){
		return false;
	}
	//step 2: push callback to signal subscription array
	subscriptions[signal].push({cb:callback});
	//step 3: increment subscription counter
	subscriptionCount++;
	//step 4: if retroactive == true then
	if (retroactive === true){
	//step 5: 	iterate through signals array
		const len = signals.length;
		for (let i = 0; i < len; i++){
		//step 6:     if signal == subscription signal then fire callback function with props as first arg
			if (signal === signals[i].signal){
				let props = signals[i].props;
				callback(props);
			}
		//step 7:   end loop
		}
		//step 8: end if
	}
	//step 9: return the array location of the callback for unsubscribing
	return subscriptions[signal].length - 1;
};

const unsubscribe = (signal = null, id = null) => {
	//step 1a: validate signal against whitelist
	const signalIsValid = validate(signal);
	if (!signalIsValid){
		message("ERROR:unable to find that signal in the whitelist");
		return false;
	}
	//step 1b: validate id is integer greater than or equal to zero
	if (typeof(id) !== "number" || id < 0){
		message("ERROR: the id provided is not a number or less than zero");
		return false;
	}
	//step 2: validate that the subscription actually exists
	if (typeof(subscriptions[signal][id]) === "undefined"){
		message("ERROR: the subscription you want to unsubscribe to was not found");
		return false;
	}
	//step 3: set the callback property to equal null instead of pointing at the callback function
	subscriptions[signal][id].cb = null;
	//step 4: decrement subscription counter
	subscriptionCount--;
	//step 5: return boolean to indicate success of unsubscription
	return true;
};

const publish = (signal = null, props) => {
	//step 1a: validate signal against whitelist
	const signalIsValid = validate(signal);
	if (!signalIsValid){
		return false;
	}
	//step 1b: validate props is of type object
	if (typeof(props) !== "object"){
		return false;
	}
	//step 2: iterate through signal specific subscriptions
	const subs = subscriptions[signal];
	const len = subs.length;
	for (let i = 0; i < len; i++){
		//step 3: 	validate callback is of type function
		if (typeof(subs[i].cb) === "function"){
			//step 4: 	if step 3 is true than fire the callback and pass props object as first argument
			subs[i].cb(props);
		}
	//step 5: exit loop
	}
	//step 6: make JS object out of signal, props and timestamp
	//let o = {signal:signal, props:props, ts: new Date().getTime() };
	let o = {signal:signal, props:props };
	//step 7: push object to signals array
	signals.push(o)
	//step 8: return true
	return true;
};

const message = (str) => {
	//step 1: if browser has console then continue
	if (typeof(console) !== "object"){
		return false;
	}
	if (typeof(console.log) !== "function"){
		return false;
	}
	//step 2: if debug mode is on then continue
	if (!debugMode){
		return false;
	}
	//step 3: console message
	console.log(str);
	//step 4: return true
	return true;
};

const validate = (signal) => {
	const len = whitelist.length;
	for (let i = 0; i < len; i++){
		if (whitelist[i] === signal){
			return true;
		}
	}
	return false;
};

const PubSub = {
	count : subscriptionCount,
	debug : debugMode,
	message : message,
	publish : publish,
	signals : signals,
	subscribe : subscribe,
	subscriptions : subscriptions,
	unsubscribe : unsubscribe,
	whitelist : whitelist
};

if (typeof(window) !== "undefined"){
	window.PubSub = PubSub;	
}

module.exports = {};
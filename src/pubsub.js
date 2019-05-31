const signals = [];
const subscriptions = {"LOADED":[], "READ":[]};
const subscriptionCount = 0;
const whitelist = ["LOADED", "READ"];

const subscribe = (signal = null, callback = null, retroactive = false) => {
	//step 1a: validate signal against whitelist
	//step 1b: validate callback is of type function
	//step 1c: return false if validation fails
	//step 2: push callback to signal subscription array
	//step 3: increment subscription counter

	//step 4: if retroactive == true then
	//step 5: 	iterate through signals array
	//step 6:     if signal == subscription signal then fire callback function with props as first arg
	//step 7:   end loop
	//step 8: end if

	//step 9: return the array location of the callback for unsubscribing
};

const unsubscribe = (signal = null, id = null) => {
	//step 1a: validate signal against whitelist
	//step 1b: validate id is integer greater than or equal to zero
	//step 1c: return false if validation fails
	//step 2: validate that the subscription actually exists
	//step 3: set the callback property to equal null instead of pointing at the callback function
	//step 4: decrement subscription counter
	//step 5: return boolean to indicate success/failure of unsubscription
};

const publish = (signal = null, props = null) => {
	//step 1a: validate signal against whitelist
	//step 1b: validate props is of type object
	//step 1c: return false if validation fails
	//step 2: iterate through signal specific subscriptions
	//step 3: 	validate callback is of type function
	//step 4: 	if step 3 is true than fire the callback and pass props object as first argument
	//step 5: exit loop
	//step 6: make JS object out of signal, props and timestamp 
	//step 7: push object to signals array
	//step 8: return true
};

const message = (str) => {
	//step 1: if debug mode is on then continue
	//step 2: if browser has console then continue
	//step 3: console message
	//step 4: return true
};

const PubSub = {
	count : subscriptionCount,
	debug : false,
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
import defaultExport from "../pubsub.js";

describe("publisher test suite", ()=>{

	beforeAll(() => {
		window.raceCallbackCount = 0;
		window.callback0 = ()=>{
			console.log("Tracking that the page was loaded.");
		};
		window.callback1 = ()=>{
			console.log("Tracking that the article was read.");
		};
		window.callback2 = ()=>{
			console.log("Second callback that is tracking that the article was read.");
		};
		window.callback3 = ()=>{
			raceCallbackCount++;
			console.log("Second callback that is tracking that the page was loaded.");
		};

		window.spy0 = spyOn(window, "callback0");
		window.spy1 = spyOn(window, "callback1");
		window.spy2 = spyOn(window, "callback2");
		window.spy3 = spyOn(window, "callback3");
	});

	afterAll(() =>{
		spy0.mockRestore();
		spy1.mockRestore();
		spy2.mockRestore();
		spy3.mockRestore();
	});

	it("filters out signals that are being passed that are not on the whitelist", () => {
		expect(window.PubSub.publish("LOADED", {})).toBeTruthy();
		expect(window.PubSub.publish("READ", {})).toBeTruthy(); //raceCallbackCount = 1
		expect(window.PubSub.publish("STREAMED", {})).toBeFalsy();
		expect(window.PubSub.publish("WATCHED", {})).toBeFalsy();
		expect(window.PubSub.publish("LIKED", {})).toBeFalsy();
	});

	it("broadcasts to the right subscribers", () => {

		window.zero = window.PubSub.subscribe("LOADED", callback0);
		window.one = window.PubSub.subscribe("READ", callback1);
		window.two = window.PubSub.subscribe("READ", callback2);

		expect(zero).toEqual(0);
		expect(one).toEqual(1);
		expect(two).toEqual(2);
		
		expect(window.PubSub.subscriptions.length).toEqual(3);
		expect(window.PubSub.subscriptions["LOADED"]).toContain({signal:"LOADED", callback:callback0});
		expect(window.PubSub.subscriptions["READ"]).toContain({signal:"READ", callback:callback1});
		expect(window.PubSub.subscriptions["READ"]).toContain({signal:"READ", callback:callback2});

		expect(window.PubSub.publish("LOADED", {})).toBeTruthy();

		expect(spy1).toHaveBeenCalled();
		expect(spy2).not.toHaveBeenCalled();
		expect(spy3).not.toHaveBeenCalled();

		expect(window.PubSub.publish("READ", {})).toBeTruthy(); //raceCallbackCount = 2

		expect(spy1).not.toHaveBeenCalled();
		expect(spy2).toHaveBeenCalled();
		expect(spy3).toHaveBeenCalled();
	});

	it("tells you when you are trying to unsubscribe from something that doesn't exist", () => {
		expect(window.PubSub.unsubscribe(5)).toBeFalsy();
	});

	it("doesn't broadcast the signal to an unsubscriber", ()=>{
		
		expect(window.PubSub.unsubscribe(one)).toBeTruthy();

		expect(window.PubSub.publish("READ", {})).toBeTruthy(); //raceCallbackCount = 3

		expect(spy0).not.toHaveBeenCalled();
		expect(spy1).not.toHaveBeenCalled();
		expect(spy2).toHaveBeenCalled();
		expect(spy3).not.toHaveBeenCalled();

		expect(window.PubSub.subscriptions.length).toEqual(2);
		expect(window.PubSub.subscriptions["LOADED"]).toContain({signal:"LOADED", callback:callback0});
		expect(window.PubSub.subscriptions["READ"]).toContain({signal:"READ", callback:callback2});

	});

	it("handles race conditions during onload by back calling historically published signals", () => {

		window.three = window.PubSub.subscribe("READ", callback3, true);
		expect(three).toEqual(4);

		expect(window.PubSub.subscriptions.length).toEqual(3);

		expect(window.raceCallbackCount).toEqual(3);

		expect(spy0).not.toHaveBeenCalled();
		expect(spy1).not.toHaveBeenCalled();
		expect(spy2).not.toHaveBeenCalled();
		expect(spy3).toHaveBeenCalled();
	});

	
});
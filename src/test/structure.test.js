import defaultExport from "../pubsub.js";
describe("test suite for managing signals passing through pub sub", ()=>{

	beforeAll(()=>{
		global.callback1 = ()=>{ console.log("I am callback 1")};
	});
	it("the subscriptions list is empty", () => {
		expect(window.PubSub.whitelist).toEqual(["LOADED","READ"]);
	});

	it("the subscriptions list is a hash and not an array", () => {
		expect(window.PubSub.subscriptions).toEqual({"LOADED":[], "READ":[]});

		expect(window.PubSub.subscribe("LOADED", callback1 )).toEqual(0);
		expect(window.PubSub.subscriptions).toEqual({"LOADED":[{cb:callback1}],"READ":[]});
	});

	it("should have history of all signals fired", () => {
		expect(window.PubSub.publish("LOADED", {}));
		expect(window.PubSub.publish("READ", {}));
		expect(window.PubSub.signals).toEqual([{signal:"LOADED", props:{}}, {signal:"READ", props:{}}]);
	});
	
});
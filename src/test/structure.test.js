import defaultExport from "../pubsub.js";
describe("test suite for managing signals passing through pub sub", ()=>{

	beforeAll(()=>{
		window.callback1 = ()=>{ console.log("I am calback1.")};
	});
	it("the subscriptions list is empty", () => {
		expect(window.PubSub.whitelist).toEqual(["LOADED","READ"]);
	});

	it("the subscriptions list is a hash and not an array", () => {
		expect(window.PubSub.subscriptions).toEqual({"LOADED":[], "READ":[]});

		expect(window.PubSub.subscribe("LOADED", window.callback1 )).toEqual(1);
		expect(window.PubSub.subscriptions).toEqual({"LOADED":{"1":{cb:window.callback1}}});
	});

	it("should have history of all signals fired", () => {
		expect(window.PubSub.publish("LOADED", {}));
		expect(window.PubSub.publish("READ", {}));
		expect(window.PubSub.signals).toEqual([{signal:"LOADED", props:{}}, {signal:"READ", props:{}}]);
	});
	
});
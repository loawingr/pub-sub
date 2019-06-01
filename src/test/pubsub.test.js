import defaultExport from "../pubsub.js";

//https://medium.com/@andrei.pfeiffer/jest-matching-objects-in-array-50fe2f4d6b98
expect.extend({
    toContainObject(received, argument) {

        const pass = this.equals(received, 
            expect.arrayContaining([
                expect.objectContaining(argument)
            ])
        );
        if (pass) {
            return {
                message: () => (`expected ${this.utils.printReceived(received)} not to contain object ${this.utils.printExpected(argument)}`),
                pass: true
            };
        } else {
            return {
                message: () => (`expected ${this.utils.printReceived(received)} to contain object ${this.utils.printExpected(argument)}`),
                pass: false
            };
        }
    }
});

describe("publisher test suite", ()=>{

    beforeAll(() => {
        global.raceCallbackCount = 0;
        global.callback0 = ()=>{
            console.log("Tracking that the page was loaded.");
        };
        global.callback1 = ()=>{
            console.log("Tracking that the article was read.");
        };
        global.callback2 = ()=>{
            console.log("Second callback that is tracking that the article was read.");
        };
        global.callback3 = ()=>{
            raceCallbackCount++;
            console.log("Second callback that is tracking that the page was loaded.");
        };

        global.spy0 = jest.spyOn(global, "callback0").mockName("firstLoad");
        global.spy1 = jest.spyOn(global, "callback1").mockName("firstRead");
        global.spy2 = jest.spyOn(global, "callback2").mockName("secondRead");
        global.spy3 = jest.spyOn(global, "callback3").mockName("secondLoad");

    });

    afterEach(() =>{
        global.spy0.mockClear();
        global.spy1.mockClear();
        global.spy2.mockClear();
        global.spy3.mockClear();
    });

    it("filters out signals that are being passed that are not on the whitelist", () => {
        expect(window.PubSub.publish("LOADED", {})).toBeTruthy();
        expect(window.PubSub.publish("READ", {})).toBeTruthy(); //raceCallbackCount = 1
        expect(window.PubSub.publish("STREAMED", {})).toBeFalsy();
        expect(window.PubSub.publish("WATCHED", {})).toBeFalsy();
        expect(window.PubSub.publish("LIKED", {})).toBeFalsy();
    });

    it("broadcasts to the LOADED subscriber", () => {

        global.zeroL = window.PubSub.subscribe("LOADED", callback0);
        global.zeroR = window.PubSub.subscribe("READ", callback1);
        global.oneR = window.PubSub.subscribe("READ", callback2);

        expect(zeroL).toEqual(0);
        expect(zeroR).toEqual(0);
        expect(oneR).toEqual(1);
        
        expect(window.PubSub.subscriptions["LOADED"].length).toEqual(1);
        expect(window.PubSub.subscriptions["READ"].length).toEqual(2);
        expect(window.PubSub.subscriptions["LOADED"]).toContainObject({cb:callback0});
        expect(window.PubSub.subscriptions["READ"]).toContainObject({cb:callback1});
        expect(window.PubSub.subscriptions["READ"]).toContainObject({cb:callback2});

        expect(window.PubSub.publish("LOADED", {})).toBeTruthy();

        expect(global.spy0).toHaveBeenCalled();
        expect(global.spy1).not.toHaveBeenCalled();
        expect(global.spy2).not.toHaveBeenCalled();
        expect(global.spy3).not.toHaveBeenCalled();

    });

    it("broadcasts to the READ subscribers", () => {
    
        expect(window.PubSub.publish("READ", {})).toBeTruthy(); //raceCallbackCount = 2
    
        expect(global.spy0).not.toHaveBeenCalled(); //LOADED
        expect(global.spy1).toHaveBeenCalled(); //READ
        expect(global.spy2).toHaveBeenCalled(); //READ
        expect(global.spy3).not.toHaveBeenCalled(); //LOADED
    });

    it("tells you when you unsubscribe failed", () => {
        expect(window.PubSub.unsubscribe("READ", 5)).toBeFalsy();
        expect(window.PubSub.unsubscribe("READ", "LOADED")).toBeFalsy();
        expect(window.PubSub.unsubscribe("WATCHED", 1)).toBeFalsy();
    });

    it("tells you when you subscribe failed", () => {
        expect(window.PubSub.subscribe("LISTENED", 5)).toBeFalsy();
        expect(window.PubSub.subscribe("READ", "LOADED")).toBeFalsy();
        expect(window.PubSub.subscribe("LOADED", ()=>{}, {})).toBeFalsy();
    });

    it("tells you when publish failed", () => {
        expect(window.PubSub.publish("READ", 5)).toBeFalsy();
    });

    it("doesn't broadcast the signal to an unsubscriber", ()=>{
        
        expect(window.PubSub.unsubscribe("READ", zeroR)).toBeTruthy(); //unsubscribe from READ

        expect(window.PubSub.publish("READ", {})).toBeTruthy(); //raceCallbackCount = 3

        expect(window.spy0).not.toHaveBeenCalled();
        expect(window.spy1).not.toHaveBeenCalled();
        expect(window.spy2).toHaveBeenCalled();
        expect(window.spy3).not.toHaveBeenCalled();

        expect(window.PubSub.subscriptions["LOADED"].length).toEqual(1);
        expect(window.PubSub.subscriptions["READ"].length).toEqual(2); //we don't delete the subscription item
        expect(window.PubSub.subscriptions["LOADED"]).toContainObject({cb:callback0});
        expect(window.PubSub.subscriptions["READ"]).not.toContainObject({cb:callback1});
        expect(window.PubSub.subscriptions["READ"]).toContainObject({cb:callback2});


    });

    it("handles race conditions during onload by retroactively publishing signals for that subscription", () => {

      window.twoR = window.PubSub.subscribe("READ", callback3, true);
      expect(twoR).toEqual(2);

      expect(window.PubSub.subscriptions["READ"].length).toEqual(3);

      expect(window.raceCallbackCount).toEqual(3);

      expect(spy0).not.toHaveBeenCalled();
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
      expect(spy3).toHaveBeenCalled();
    });

    it("tells you when console fails", () => {
        window.PubSub.debug = false;
        expect(window.PubSub.message("Yay! I can send a message to the console.")).toBeFalsy();
        global.console.log = {};
        expect(window.PubSub.message("Yay! I can send a message to the console.")).toBeFalsy();
        delete global.console;
        expect(window.PubSub.message("Yay! I can send a message to the console.")).toBeFalsy();
    });

});
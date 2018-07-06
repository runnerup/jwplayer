import UI from 'utils/ui';
import { Browser, OS } from 'environment/environment';
import sinon from 'sinon';

const TouchEvent = window.TouchEvent;
const Touch = window.Touch;

describe.only('UI', function() {

    const USES_POINTER_EVENTS = window.PointerEvent && ('PointerEvent' in window) && !OS.android;
    // const USES_POINTER_EVENTS = false;

    let sandbox;
    let button;

    // polyfill Pointer event constructor for ie
    let PointerEvent = window.PointerEvent;
    if (Browser.ie && typeof window.CustomEvent !== 'function') {
        PointerEvent = function(inType, params) {
            params = params || {};
            const e = document.createEvent('CustomEvent');
            e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
            Object.assign(e, params);
            return e;
        };
        PointerEvent.prototype = window.MouseEvent.prototype;
    }

    beforeEach(function() {
        sandbox = sinon.sandbox.create();

        // add fixture
        const fixture = document.createElement('div');
        fixture.id = 'test-container';
        button = document.createElement('div');
        button.id = 'button';
        fixture.appendChild(button);
        document.body.appendChild(fixture);
    });

    afterEach(function() {
        sandbox.restore();

        // remove fixture
        const fixture = document.querySelector('#test-container');
        document.body.removeChild(fixture);
    });

    function spyOnDomEventListenerMethods(elements) {
        elements.forEach(element => {
            element.addEventListener.restore && element.addEventListener.restore();
            element.removeEventListener.restore && element.removeEventListener.restore();
            sandbox.spy(element, 'addEventListener');
            sandbox.spy(element, 'removeEventListener');
        });
    }

    it('is a class', function() {
        expect(UI).to.be.a('function');
        expect(UI.constructor).to.be.a('function');
    });

    it('extends events', function() {
        const ui = new UI(button);
        expect(ui).to.have.property('on').which.is.a('function');
        expect(ui).to.have.property('once').which.is.a('function');
        expect(ui).to.have.property('off').which.is.a('function');
        // Why do we expose trigger?
        expect(ui).to.have.property('trigger').which.is.a('function');
        ui.destroy();
    });

    it('implements a destroy method', function() {
        const ui = new UI(button);
        expect(ui).to.have.property('destroy').which.is.a('function');
        ui.destroy();
    });

    it('fires click events with pointer and mouse events', function() {
        if (OS.android) {
            // Only 'tap' is triggered for touch events
            return;
        }
        const clickSpy = sandbox.spy();
        const ui = new UI(button).on('click tap', clickSpy);
        let result;
        if (USES_POINTER_EVENTS) {
            result = button.dispatchEvent(new PointerEvent('pointerdown', {
                isPrimary: true,
                pointerType: 'mouse',
                view: window,
                bubbles: true,
                cancelable: true
            }));
            button.dispatchEvent(new PointerEvent('pointerup', {
                isPrimary: true,
                pointerType: 'mouse',
                view: window,
                bubbles: true,
                cancelable: true
            }));
        } else {
            result = button.dispatchEvent(new MouseEvent('mousedown', {
                view: window,
                bubbles: true,
                cancelable: true
            }));
            button.dispatchEvent(new MouseEvent('mouseup', {
                view: window,
                bubbles: true,
                cancelable: true
            }));
        }

        expect(result, 'preventDefault not called').to.equal(true);
        expect(clickSpy).to.have.callCount(1);
        expect(clickSpy).calledWithMatch({
            type: 'click'
        });

        ui.destroy();
    });

    it('fires tap events with pointer and touch events', function() {
        const tapSpy = sandbox.spy();
        const ui = new UI(button).on('click tap', tapSpy);
        let result;
        if (USES_POINTER_EVENTS) {
            result = button.dispatchEvent(new PointerEvent('pointerdown', {
                isPrimary: true,
                pointerType: 'touch',
                view: window,
                bubbles: true,
                cancelable: true
            }));
            button.dispatchEvent(new PointerEvent('pointerup', {
                isPrimary: true,
                pointerType: 'touch',
                view: window,
                bubbles: true,
                cancelable: true
            }));
        } else if (TouchEvent) {
            const touch = new Touch({
                identifier: 1,
                target: button
            });
            result = button.dispatchEvent(new TouchEvent('touchstart', {
                changedTouches: [ touch ],
                view: window,
                bubbles: true,
                cancelable: true
            }));
            button.dispatchEvent(new TouchEvent('touchend', {
                changedTouches: [ touch ],
                view: window,
                bubbles: true,
                cancelable: true
            }));
        } else {
            // Touch not supported in this browser
            ui.destroy();
            return;
        }
        expect(result, 'preventDefault not called').to.equal(true);
        expect(tapSpy).to.have.callCount(1);
        expect(tapSpy).calledWithMatch({
            type: 'tap'
        });
        ui.destroy();
    });

    it('preventScrolling uses setPointerCapture and preventDefault', function() {
        const ui = new UI(button, {
            preventScrolling: true
        });
        let result;
        let event;
        if (USES_POINTER_EVENTS) {
            event = new PointerEvent('pointerdown', {
                isPrimary: true,
                pointerType: 'mouse',
                pointerId: 1,
                view: window,
                bubbles: true,
                cancelable: true
            });
            sandbox.stub(button, 'setPointerCapture').callsFake(sinon.spy());
            sandbox.stub(button, 'releasePointerCapture').callsFake(sinon.spy());
            sandbox.spy(event, 'preventDefault');
            result = button.dispatchEvent(event);
            expect(button.setPointerCapture).to.have.callCount(1);
        } else {
            event = new MouseEvent('mousedown', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            sandbox.spy(event, 'preventDefault');
            result = button.dispatchEvent(event);
        }
        if (!Browser.ie && !OS.android) {
            expect(result, 'preventDefault called').to.equal(false);
            expect(event.preventDefault).to.have.callCount(1);
        }

        ui.destroy();
    });

    it('constructor does not add event listeners to window, document or body ', function() {
        spyOnDomEventListenerMethods([
            window,
            document,
            document.body,
            button
        ]);

        const ui = new UI(button, {
            useFocus: true,
            useHover: true,
            useMove: true
        });
        expect(window.addEventListener, 'window').to.have.callCount(0);
        expect(window.removeEventListener, 'window').to.have.callCount(0);
        expect(document.addEventListener, 'document').to.have.callCount(0);
        expect(document.removeEventListener, 'document').to.have.callCount(0);
        expect(document.body.addEventListener, 'body').to.have.callCount(0);
        expect(document.body.removeEventListener, 'body').to.have.callCount(0);
        expect(button.removeEventListener, 'button').to.have.callCount(0);
        ui.destroy();
    });

    it('constructor adds event listeners based on options', function() {
        let ui;

        spyOnDomEventListenerMethods([ button ]);
        ui = new UI(button);
        if (USES_POINTER_EVENTS || OS.android) {
            expect(button.addEventListener, 'button without options').to.have.callCount(2);
        } else {
            expect(button.addEventListener, 'button without options').to.have.callCount(3);
        }
        ui.destroy();

        spyOnDomEventListenerMethods([ button ]);
        ui = new UI(button, {
            useFocus: true,
            useHover: true,
            useMove: true
        });
        if (USES_POINTER_EVENTS) {
            expect(button.addEventListener, 'button with useFocus, useHover, useMove').to.have.callCount(7);
        } else if (OS.android) {
            expect(button.addEventListener, 'button with useFocus, useHover, useMove').to.have.callCount(4);
        } else {
            expect(button.addEventListener, 'button with useFocus, useHover, useMove').to.have.callCount(8);
        }
        ui.destroy();
    });

    it('removes all event listeners on destroy', function() {
        spyOnDomEventListenerMethods([ button ]);

        const ui = new UI(button, {
            useFocus: true,
            useHover: true,
            useMove: true
        });
        ui.destroy();
        if (USES_POINTER_EVENTS) {
            expect(button.removeEventListener, 'button').to.have.callCount(16);
        } else {
            expect(button.removeEventListener, 'button').to.have.callCount(9);
        }
    });

});

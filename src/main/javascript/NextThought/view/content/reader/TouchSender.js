Ext.define('NextThought.view.content.reader.TouchSender', {

    alias: 'reader.touchSender',

    statics: {
        SCROLL_TIME_STEP: 1,
        SCROLL_FRICTION: 0.05,
        SCROLL_MAX_SPEED: 200,
        SCROLL_THRESHOLD_SPEED: 1,
        /**
         * Pixel distance a touch can move to still be considered a tap
         */
        TAP_THRESHOLD: 15,
        /**
         * Time required for a long press
         */
        TAP_HOLD_TIME: 1000,
        /**
         * Various states for a fsm to determine possible
         * touch interactions.
         */
        STATE: {
            NONE: 0,
            DOWN: 1,
            SCROLLING: 2,
            SELECTING: 3,
            DRAGGING: 4
        }
    },

    /**
     * Implements the touch interactions for the reader if the current
     * platform is an iPad.
     * @param config
     */
    constructor: function(config) {
        // Only support touch on iPad devices
        if (!Ext.is.iPad)
            return;

        Ext.apply(this, config);
        this.registeredHandler = null;

        this.container.on('afterrender', function() {
            this.setupTouchHandlers();
        }, this);
    },

    /**
     * Setup the handlers for the various touch events for
     * click and scroll
     */
    setupTouchHandlers: function() {
        var me = this,
            s = me.statics(),
            container = me.container,
            dom = container.getEl().dom,
            state = s.STATE.NONE,

            pickedElement = null,
            initialTime,
            initialX, initialY,
            lastX, lastY,
            //current movement delta
            vel;

        function withinTapThreshold() {
            return Math.abs(lastY-initialY) < s.TAP_THRESHOLD;
        }

        dom.addEventListener('touchstart', function(e) {
            e.preventDefault();
            var handler = me.registeredHandler;
            handler.touchStart();

            // Only start a new touch if all touches are off
            if (state !== s.STATE.NONE)
                return;
            state = s.STATE.DOWN;
            pickedElement = handler.elementAt(e.pageX, e.pageY);

            initialTime = Date.now();
            initialY = e.touches[0].pageY;
            initialX = e.touches[0].pageX;
            lastY = initialY;
            vel = 0;

            console.log('touchStart');

            setTimeout(function() {
                if (state !== s.STATE.DOWN)
                    return;

                console.log('long press');
                vel=0;
                if (handler.elementIsDraggable(pickedElement)) {
                    state = s.STATE.DRAGGING;
                    console.log('start dragging');
                }
                else if (handler.elementIsSelectable(pickedElement)) {
                    state = s.STATE.SELECTING;
                    console.log('start selecting');
                    // TODO: Some animation to show user selecting has started?
                }
            }, s.TAP_HOLD_TIME);
        }, false);

        dom.addEventListener('touchmove', function(e) {
            e.preventDefault();

            var touch = e.touches[0],
                handler = me.registeredHandler;

            console.log('touchMove');

            if (state === s.STATE.DOWN) {
                scrollMove();
                if (!withinTapThreshold())
                    state = s.STATE.SCROLLING;
            }
            else if (state === s.STATE.SCROLLING) {
                scrollMove();
            }
            else if (state === s.STATE.SELECTING) {
                selectMove();
            }
            else if (state === s.STATE.DRAGGING) {
                // TODO: Update Dragged element
            }
            else
                console.warn('Unknown touch state on touchMove!');

            function scrollMove() {
                vel = lastY - touch.pageY;
                updatePos();
                handler.scroll(pickedElement, vel);
            }

            function selectMove() {
                updatePos();
                handler.highlight(initialX, initialY,
                                  touch.pageX, touch.pageY);
            }

            function updatePos() {
                lastY = touch.pageY;
                lastX = touch.pageX;
            }

        }, false);

        function shouldSelectAllOnTap() {
            return pickedElement.tagName === 'INPUT';
        }

        dom.addEventListener('touchend', function(e){
            e.preventDefault();

            var startLt0 = vel<0,
                lastUpdateTime = Date.now(),
                tempState = state,
                handler = me.registeredHandler;
            state = s.STATE.NONE;

            console.log('touchEnd');

            if (tempState === s.STATE.DOWN) {
                // Send click/select event to the tapped element
                if (shouldSelectAllOnTap())
                    pickedElement.setSelectionRange(0,1000);
                else
                    pickedElement.click();
            }
            else if (tempState === s.STATE.SCROLLING) {
                // Cap the ending velocity at the max speed
                if (Math.abs(vel) > s.SCROLL_MAX_SPEED)
                    vel = startLt0? -s.SCROLL_MAX_SPEED : s.SCROLL_MAX_SPEED;
                kineticScroll();
            }
            else if (tempState === s.STATE.SELECTING) {
                // TODO: Update Selection
                console.log('stop selection');
                var range = handler.makeRangeFrom(initialX, initialY,
                        lastX, lastY),
                    xy = [lastX, lastY];
                handler.addAnnotation(range, xy);
            }
            else if (tempState === s.STATE.DRAGGING) {
                // TODO: Update Dragged element
                console.log('stop dragging');
            }
            else
                console.warn('Unknown touch state on touchEnd!');


            function kineticScroll() {
                var lt0 = vel< 0,
                    currentTime = Date.now(),
                    deltaTime = currentTime-lastUpdateTime,
                    aboveThreshold, sameDirection;
                lastUpdateTime = currentTime;

                // Continue scrolling if above the movement threshold
                // and hasn't changed directions
                aboveThreshold = (lt0 ? -vel : vel) > s.SCROLL_THRESHOLD_SPEED;
                sameDirection = startLt0 === lt0;

                if ( aboveThreshold && sameDirection && state === s.STATE.NONE ){
                    // Apply friction in the opposite movement direction
                    // based on the time passed for smoother movement
                    vel+= (lt0 ? s.SCROLL_FRICTION : -s.SCROLL_FRICTION)*deltaTime;

                    handler.scroll(pickedElement, vel);
                    setTimeout(kineticScroll, s.SCROLL_TIME_STEP);
                }
            }
        }); // eo touchEnd

    }, // eo setupTouchHandlers

    registerHandler: function(touchHandler) {
        this.registeredHandler = touchHandler;
    }

});
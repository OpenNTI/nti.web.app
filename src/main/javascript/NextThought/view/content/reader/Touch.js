Ext.define('NextThought.view.content.reader.Touch', {

    alias: 'reader.touch',

    requires: [
        'NextThought.view.content.reader.IFrame',
        'NextThought.view.content.reader.Scroll',
        'NextThought.view.content.reader.TouchHighlight'
    ],

    statics: {
        SCROLL_TIME_STEP: 1,
        SCROLL_FRICTION: 0.05,
        SCROLL_MAX_SPEED: 200,
        SCROLL_THRESHOLD_SPEED: 1,
        TAP_TIME: 2,
        TAP_THRESHOLD: 15,
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
        var reader = this.reader;

        reader.on('afterrender', function() {
            reader.getIframe().setClickthrough(true);
            this.setupTouchHandlers();
        }, this);
    },

    /**
     * Setup the handlers for the various touch events for
     * click and scroll
     */
    setupTouchHandlers: function() {
        var s = this.statics(),
            reader = this.reader,
            scroll = reader.getScroll(),
            highlight = reader.getTouchHighlight(),
            dom = reader.getEl().dom,
            state = s.STATE.NONE,
            iFrame = reader.getIframe(),

            previouslyPickedElement = null,
            previouslyPickedElementStyle = '',
            pickedElement = null,
            initialTime,
            initialY,
            initialX,
            lastY,
            //current movement delta
            vel;

        function withinTapThreshold() {
            return Math.abs(lastY-initialY) < s.TAP_THRESHOLD;
        }

        function elementIsSelectable(ele) {
            if (!ele) return false;
            var tag = ele.tagName,
                tags = ['P', 'A', 'SPAN'];
            return Ext.Array.contains(tags, tag);
        }
        function elementIsDraggable(ele) {
            if (!ele) return false;
            var obj = Ext.get(ele);
            return obj.hasCls('draggable-area') || obj.up('.draggable-area');
        }

        dom.addEventListener('touchstart', function(e) {
            e.preventDefault();

            // Only start a new touch if all touches are off
            if (state !== s.STATE.NONE)
                return;
            state = s.STATE.DOWN;
            pickedElement = iFrame.elementAt(e.pageX, e.pageY);

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
                if (elementIsDraggable(pickedElement)) {
                    state = s.STATE.DRAGGING;
                    console.log('start dragging');
                }
                else if (elementIsSelectable(pickedElement)) {
                    state = s.STATE.SELECTING;
                    console.log('start selecting');
                    highlight.show(initialX, initialY);
                }
            }, s.TAP_HOLD_TIME);
        }, false);

        dom.addEventListener('touchmove', function(e) {
            e.preventDefault();

            var touch = e.touches[0];

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
                lastY = touch.pageY;
                scroll.by(vel);
            }

            function selectMove() {
                //iFrame.makeSelectionFrom(initialX, initialY,
                //                         touch.pageX, touch.pageY);
                highlight.show(touch.pageX, touch.pageY);
            }

        }, false);

        function shouldSelectAllOnTap() {
            return pickedElement.tagName === 'INPUT';
        }

        dom.addEventListener('touchend', function(e){
            e.preventDefault();

            var startLt0 = vel<0,
                lastUpdateTime = Date.now(),
                tempState = state;
            state = s.STATE.NONE;

            console.log('touchEnd');

            if (tempState === s.STATE.DOWN) {
                // Send click/select event to the tapped element
                if (shouldSelectAllOnTap())
                    pickedElement.setSelectionRange(0,1000);
                else
                    pickedElement.click();

                // DEBUG testing code that highlights the selected element
                if (previouslyPickedElement){
                    previouslyPickedElement.style.backgroundColor = previouslyPickedElementStyle;
                }
                previouslyPickedElement = pickedElement;
                previouslyPickedElementStyle = previouslyPickedElement.style.backgroundColor;
                pickedElement.style.backgroundColor = 'red';
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

                    scroll.by(vel);
                    setTimeout(kineticScroll, s.SCROLL_TIME_STEP);
                }
            }
        }); // eo touchEnd

    } // eo setupTouchHandlers

});
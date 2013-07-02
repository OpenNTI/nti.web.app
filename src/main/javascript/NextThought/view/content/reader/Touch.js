Ext.define('NextThought.view.content.reader.Touch', {

    alias: 'reader.touch',

    requires: ['NextThought.view.content.reader.IFrame',
               'NextThought.view.content.reader.Scroll'],

    statics: {
        SCROLL_TIME_STEP: 1,
        SCROLL_FRICTION: 0.05,
        SCROLL_MAX_SPEED: 200,
        SCROLL_THRESHOLD_SPEED: 1,
        TAP_TIME: 2,
        TAP_HOLD_TIME: 1000
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
            this.addIFrameClickthrough();
            this.setupTouchHandlers();
        }, this);
    },

    /**
     * Makes pointer events go through the iframe so that all the
     * interactions can be handled manually.
     */
    addIFrameClickthrough: function() {
        var reader = this.reader,
            iFrameMod = reader.getIframe(),
            iFrameEle = iFrameMod.get();
        if (iFrameEle)
            iFrameEle.addCls('clickthrough');
    },

    /**
     * Setup the handlers for the various touch events for
     * click and scroll
     */
    setupTouchHandlers: function() {
        var s = this.statics(),
            reader = this.reader,
            scroll = reader.getScroll(),
            dom = reader.getEl().dom,
            anotherTouchStarted,
            startY,
            //current movement delta
            vel;

        dom.addEventListener('touchstart', function(e) {
            e.preventDefault();
            anotherTouchStarted = true;

            startY = e.touches[0].pageY;
            vel = 0;

            setTimeout(function() {
                // TODO: check for long press
                var isLongPress = false;
                if (isLongPress) {

                }
            }, s.TAP_HOLD_TIME);
        }, false);

        dom.addEventListener('touchmove', function(e) {
            e.preventDefault();

            var touch = e.touches[0];
            vel = startY - touch.pageY;
            startY = touch.pageY;
            scroll.by(vel);
        }, false);

        dom.addEventListener('touchend', function(e){
            e.preventDefault();

            var startLt0 = vel<0,
                lastUpdateTime = Date.now();

            anotherTouchStarted = false;

            // Cap the ending velocity at the max speed
            if (Math.abs(vel) > s.SCROLL_MAX_SPEED)
                vel = startLt0? -s.SCROLL_MAX_SPEED : s.SCROLL_MAX_SPEED;

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
                if ( aboveThreshold && sameDirection && !anotherTouchStarted ){
                    // Apply friction in the opposite movement direction
                    // based on the time passed for smoother movement
                    vel+= (lt0 ? s.SCROLL_FRICTION : -s.SCROLL_FRICTION)*deltaTime;

                    scroll.by(vel);
                    setTimeout(kineticScroll, s.SCROLL_TIME_STEP);
                }
            }
            kineticScroll();
        });
    }
});
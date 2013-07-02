Ext.define('NextThought.view.content.reader.Touch', {

    alias: 'reader.touch',

    requires: ['NextThought.view.content.reader.IFrame',
               'NextThought.view.content.reader.Scroll'],

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
        var reader = this.reader,
            scroll = reader.getScroll(),
            dom = reader.getEl().dom,
            startY,
            //current movement delta
            vel;

        dom.addEventListener('touchstart', function(e) {
            e.preventDefault();

            // TODO: Check for the existence of elements above the touch
            startY = e.touches[0].pageY;
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

            var TIME_STEP = 1,
                FRICTION = 0.05,
                MAX_SPEED = 200,
                THRESHOLD_SPEED = 1,
                startLt0 = vel<0,
                lastUpdateTime = Date.now();

            // Cap the ending velocity at the max speed
            if (Math.abs(vel) > MAX_SPEED)
                vel = startLt0? -MAX_SPEED : MAX_SPEED;

            function kineticScroll() {
                var lt0 = vel< 0,
                    currentTime = Date.now(),
                    deltaTime = currentTime-lastUpdateTime;
                lastUpdateTime = currentTime;

                // Apply friction in the opposite movement direction
                // based on the time passed for smoother movement
                vel+= (lt0 ? FRICTION : -FRICTION)*deltaTime;

                // Continue scrolling if above the movement threshold
                // and hasn't changed directions
                if ((lt0 ? -vel : vel) > THRESHOLD_SPEED && startLt0===lt0){
                    scroll.by(vel);
                    setTimeout(kineticScroll, TIME_STEP);
                }
            }
            kineticScroll();
        });
    }
});
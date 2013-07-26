Ext.define('NextThought.modules.TouchHandler', {

    alias: 'modules.touchHandler',

    requires: [
        'NextThought.modules.TouchSender'
    ],

    constructor: function(config) {
        // Only support touch on iPad devices
        if (!Ext.is.iPad)
            return;

        Ext.apply(this, config);

        this.container.on('afterrender', function() {
            this.setupHandlers();
        }, this);
    },

    setupHandlers: function() {
        var container = this.container,
            initialY = false;

        container.on('touchScroll', function(ele, deltaY) {
            console.log('SCROLLING!');

            var panel = this.getPanel(),
                currentY = panel.getY(),
                newY = currentY - deltaY,
                containerHeight = panel.getHeight(),
                parentHeight = panel.parent().getHeight(),
                minY;

            if (containerHeight <= parentHeight) {
                panel.setY(initialY, false);
                return;
            }

            if (initialY === false)
                initialY = currentY;

            minY  = initialY-(containerHeight-parentHeight)

            // Clamp scroll
            if(newY < minY)
                newY = minY;
            else if (newY > initialY)
                newY = initialY;

            panel.setY(newY, false);

        }, this);

        container.on('touchElementIsScrollable', function(ele, callback) {
            callback(true);
        });

        container.on('touchElementAt', function(x,y, callback) {
            var element = Ext.getDoc().dom.elementFromPoint(x, y);
            callback(element);
        });
    },

    getPanel: function() {
        return this.container.getEl()
                             .parent()
                             .parent();
    }
});
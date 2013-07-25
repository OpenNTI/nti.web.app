Ext.define('NextThought.view.contacts.TouchHandler', {

    alias: 'contacts.touchHandler',

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

            var tab = getEL(),
                currentY = tab.getY(),
                newY = currentY - deltaY,
                containerHeight = tab.getHeight(),
                parentHeight = tab.parent().getHeight(),
                minY;

            if (containerHeight <= parentHeight) {
                tab.setY(initialY, false);
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

            tab.setY(newY, false);
        });

        container.on('touchElementIsScrollable', function(ele, callback) {
            callback(true);
        });

        container.on('touchElementAt', function(x,y, callback) {
            var element = Ext.getDoc().dom.elementFromPoint(x, y);
            callback(element);
        });

        function getEL() {
            return container.getEl()
                            .down('.x-tabpanel-child{display!=none}')
                            .child(':first');
        }
    }
});
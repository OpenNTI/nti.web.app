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

            var container = getEL(),
                currentY = container.getY(),
                newY = currentY - deltaY,
                containerHeight = container.getHeight(),
                parentHeight = container.parent().getHeight(),
                minY;

            if (containerHeight <= parentHeight) {
                container.setY(initialY, false);
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

            container.setY(newY, false);
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
                            .down('.contact-card-container')
                            .parent()
                            .parent();
        }
    }
});
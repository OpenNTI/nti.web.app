Ext.define('NextThought.view.chat.transcript.TouchHandler', {
    extend: 'NextThought.modules.TouchHandler',

    alias: 'chat.transcript.touchHandler',

    setupHandlers: function() {
        var container = this.container;

        container.on('touchScroll', function(ele, deltaY) {
            this.getPanel.scrollBy(0, deltaY, false);
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
        return this.container.down('[windowContentWrapper]').getEl();
    }
});
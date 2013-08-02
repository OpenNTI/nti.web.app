Ext.define('NextThought.view.chat.transcript.TouchHandler', {
    extend: 'NextThought.modules.TouchHandler',

    alias: 'chat.transcript.touchHandler',

    setupHandlers: function() {
        var container = this.container;

        container.on('touchScroll', function(ele, deltaY) {
            this.getPanel.scrollBy(0, deltaY, false);
        }, this);

        container.on('touchElementIsScrollable', this.elementIsAlwaysScrollable);
        container.on('touchTap', this.clickElement);
        container.on('touchElementAt', this.elementAt);
    },

    getPanel: function() {
        return this.container.down('[windowContentWrapper]').getEl();
    }
});
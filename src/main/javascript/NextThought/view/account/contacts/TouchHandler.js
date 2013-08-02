Ext.define('NextThought.view.account.contacts.TouchHandler', {
    extend: 'NextThought.modules.TouchHandler',

    alias: 'account.contacts.touchHandler',

    requires: [
        'NextThought.modules.TouchSender'
    ],

    setupHandlers: function() {
        var container = this.container,
            initialY = false;

        container.on('touchLongPress', function(ele, pageX, pageY) {
            var item = Ext.get(ele).up('.contact-row'),
                view = this.container,
                record = this.container.getRecord(item);
            container.startPopupTimeout(view, record, item, 0);
        }, this);

        container.on('touchScroll', function(ele, deltaY) {
            initialY = this.scroll(ele, deltaY, initialY);
        }, this);

        container.on('touchTap', this.clickElement);
        container.on('touchElementIsScrollable', this.elementIsAlwaysScrollable);
        container.on('touchElementAt', this.elementAt);
    },

    getPanel: function() {
        // TODO: Test with lots of online friends to see if it actually works
        return this.container.getEl()
            .down('.contact-list');
    }
});
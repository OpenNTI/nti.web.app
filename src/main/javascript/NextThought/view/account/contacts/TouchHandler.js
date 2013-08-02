Ext.define('NextThought.view.account.contacts.TouchHandler', {
    extend: 'NextThought.modules.TouchHandler',

    alias: 'account.contacts.touchHandler',

    requires: [
        'NextThought.modules.TouchSender'
    ],

    setupHandlers: function() {
        var container = this.container,
            initialY = false,
            popout = false,
            activeTargetDom;

        function removePopup() {
            if (popout) {
                popout.maybeHidePopout();
                popout = false;
            }
        }

        container.on('touchStart', function(pageX, pageY) {
            if (popout) removePopup();
        });

        container.on('touchLongPress', function(ele, pageX, pageY) {
            function cb(pop){
                if(!pop){ return; }
                popout = pop;
                pop.on('destroy', function(){
                    delete activeTargetDom;
                });
            }

            var me = this,
                item = Ext.get(ele).up('.contact-row'),
                el = Ext.fly(item).down('.avatar'),
                record = me.container.getRecord(item),
                pop;

            if(!record || me.activeTargetDom === Ext.getDom(Ext.fly(item))){return;}

            pop = NextThought.view.account.contacts.management.Popout;
            pop.popup(record,el,item,[-1, 0], cb);
            activeTargetDom = Ext.getDom(Ext.fly(item));
        }, this);

        container.on('touchScroll', function(ele, deltaY) {
            initialY = this.scroll(ele, deltaY, initialY);
        }, this);

        container.on('touchTap', function(ele) {
            // Only startup a chat on tap (the popup is only shown on longpress)
            var item = Ext.get(ele).up('.contact-row'),
                record;
            if (!item) return;
            record = this.container.getRecord(item);
            container.fireEvent('chat', record);
        }, this);
        container.on('touchElementIsScrollable', this.elementIsAlwaysScrollable);
        container.on('touchElementAt', this.elementAt);
    },

    getPanel: function() {
        // TODO: Test with lots of online friends to see if it actually works
        return this.container.getEl()
            .down('.contact-list');
    }
});
Ext.define('NextThought.view.windows.NotificationsPopover', {
    extend: 'Ext.panel.Panel',
    alias: 'window.notifications-popover',
    requires: [
        'NextThought.view.widgets.MiniStreamEntry'
    ],

    cls: 'notification-popover',
    autoScroll: true,
    floating: true,
    border: true,
    frame: false,
    width: 350,
    height: 50,
    items:[{margin: 3}],
    defaults: {border: false,
        defaults: {border: false}},

    initComponent: function() {
        this._lastLoginTime = _AppConfig.userObject.get('lastLoginTime');
        this.callParent(arguments);
    },

    render: function() {
        this.callParent(arguments);
        var me = this,
            el = me.el;

        me.alignTo(this.bindTo);
        el.mask('Loading');
        el.on('mouseenter', me.cancelClose, me);
        el.on('mouseleave', me.closePopover, me);
        el.on('click', me.itemClicked, me);

        this.updateContents();
    },

    cancelClose: function() {
        if (this.leaveTimer)
            window.clearTimeout(this.leaveTimer);
    },

    closePopover: function() {
        this.cancelClose();

        var me = this;
        this.leaveTimer = window.setTimeout(function(){
			VIEWPORT.un('resize',me.fixHeight,me);
			me.close();
		}, 750);
    },

    itemClicked: function() {
        this.close();
    },

    updateContents: function() {
        var i, unread, change,
			store = Ext.getStore('Stream'),
            readCount = 0,
			p = this.items.get(0);

        for(i = store.getCount() - 1; readCount < 2 && i >= 0; i--) {
            change = store.getAt(i);
            if (!change.get) {
                //dead change, probably deleted...
                return;
            }
            
            unread = (change.get('Last Modified') > this._lastLoginTime);
            p.add({xtype: 'miniStreamEntry', change: change, cls: unread ? 'unread' : 'read'});
            if (!unread) readCount++;
        }


        if(p.items.length === 0) {
            p.add({
                html: '<b>No new updates</b>',
                border: false,
                margin: 10
            });
        }

        this.fixHeight();
        this.el.unmask();
    },

    fixHeight: function(){
		var me = this, e, max;
        try{
            e = me.bindTo;
			max = (VIEWPORT.getHeight() - e.getPosition()[1] - e.getHeight() - 10);
            me.height = undefined;
            me.doLayout();
            if(me.getHeight()> max)
                me.setHeight(max);

            //console.debug(max, me.getHeight());
            VIEWPORT.on('resize',me.fixHeight,me, {single: true});
        }
        catch(err){
            if(me){
                console.warn('NotificationPopover Height-adjustment', err,err.stack);
            }
        }
    }



});

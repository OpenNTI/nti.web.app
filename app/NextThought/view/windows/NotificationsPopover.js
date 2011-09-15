Ext.define('NextThought.view.windows.NotificationsPopover', {
    extend: 'Ext.panel.Panel',
    alias: 'window.notifications-popover',
    requires: [
        'NextThought.view.widgets.MiniStreamEntry'
    ],

    autoScroll: true,
    floating: true,
    border: true,
    frame: false,
    width: 250,
    renderTo: Ext.getBody(),
    items:[{margin: 3}],
    defaults: {border: false,
        defaults: {border: false}},

    initComponent: function() {
        this._lastLoginTime = _AppConfig.server.userObject.get('lastLoginTime');
        this.callParent(arguments);
    },

    render: function() {
        this.callParent(arguments);
        var me = this,
            el = me.el;

        me.alignTo(this.bindTo);
        el.mask('Loading');
        el.on('mouseleave', function(){me.close();}, this);

        UserDataLoader.getRecursiveStreamSince(null, me._lastLoginTime, {scope: this, success: this.updateContents});
    },


    updateContents: function(stream) {
        var k, change,
            p = this.items.get(0);

        if(!stream || stream.length == 0) {
            p.add( {html: '<b>No new updates</b>',
                    border: false,
                    margin: 10} );
            this.el.unmask();
            return;
        }

        for(k in stream){
            if(!stream.hasOwnProperty(k))continue;

            change = stream[k];

            if (!change.get) {
                //dead change, probably deleted...
                continue;
            }

            if (change.get('Last Modified') > this._lastLoginTime)
                p.add({xtype: 'miniStreamEntry', change: change});
        }

        this.el.unmask();
    },

    fixHeight: function(){
        var me = this,
            e = me.bindTo,
            max = (VIEWPORT.getHeight() - e.getPosition()[1] - e.getHeight() - 10);
        me.height = undefined;
        me.doLayout();
        if(me.getHeight()> max)
            me.setHeight(max);

        //console.log(max, me.getHeight());
        VIEWPORT.on('resize',me.fixHeight,me, {single: true});
    }



});
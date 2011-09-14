Ext.define('NextThought.view.windows.NotificationsPopover', {
	extend: 'Ext.panel.Panel',
    alias: 'window.notifications-popover',

    autoScroll: true,
    floating: true,
    closable: true,
    border: true,
    width: 250,
    height: 250,
    renderTo: Ext.getBody(),
    items:[{margin: 3}],
    defaults: {border: false,
              defaults: {border: false}},
    _lastLoginTime: null,

    initComponent: function() {
           this.callParent(arguments);
    },

    render: function() {
       this.callParent(arguments);

       var me = this,
           u = _AppConfig.server.userObject,
           lastLogin = u.get('lastLoginTime'), //unix time
           //lastLoginDate = new Date(lastLogin * 1000),
           height = Ext.ComponentQuery.query('master-view')[0].getHeight();

        this._lastLoginTime = lastLogin;
        me.el.mask('Loading');

        UserDataLoader.getRecursiveStreamSince(
		        	null,
                    lastLogin,
                    {
                        scope: this,
                        success: this.updateContents
		        });

        //adjust the last login date to reflect that we've seen notifications
        //var dt = new Date(),
        //    unixDate = Ext.Date.format(dt, 'U');
        u.set('lastLoginTime', new Date());
        u.save();
    },


    updateContents: function(stream) {
        var k, change,
			p = this.items.get(0);

		if(!stream || stream.length == 0) {
            p.add(Ext.create('Ext.panel.Panel',
                 {html: '<b>No new updates</b>',
                     border: false,
                     margin: 10}));
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
                p.add(Ext.create('NextThought.view.widgets.MiniStreamEntry', {change: change}));
		}

        this.el.unmask();
    },

    alignTo: function() {
        this.callParent(arguments);

         var me = this,
             height = Ext.ComponentQuery.query('master-view')[0].getHeight();

        me.setHeight(height - me.getPosition(true)[1] - 10);

    }



});
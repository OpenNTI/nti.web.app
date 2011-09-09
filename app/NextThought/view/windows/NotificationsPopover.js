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

    initComponent: function() {
           this.callParent(arguments);
    },

    render: function() {
       this.callParent(arguments);

       var me = this,
           u = _AppConfig.server.userObject,
           lastLogin = u.get('lastLoginTime'),
           height = Ext.ComponentQuery.query('master-view')[0].getHeight();

        me.el.mask('Loading');

        UserDataLoader.getRecursiveStreamSince(
		        	null,
                    lastLogin,
                    {
                        scope: this,
                        success: this.updateContents
		        });

        //adjust the last login date to reflect that we've seen notifications
        u.set('lastLoginDate', new Date());
        u.save();
    },


    updateContents: function(stream) {
      	var k, change,
			p = this.items.get(0);

		if(!stream)return;

		for(k in stream){
			if(!stream.hasOwnProperty(k))continue;

			change = stream[k];

            if (!change.get) {
                //dead change, probably deleted...
                continue;
            }

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
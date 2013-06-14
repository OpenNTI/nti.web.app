//Styles defined in _history-view.scss
Ext.define('NextThought.view.account.activity.View',{
    extend: 'Ext.container.Container',
    alias: 'widget.activity-view',
    requires: [
        'NextThought.view.SecondaryTabPanel',
        'NextThought.view.account.activity.Panel',
	    'NextThought.view.account.history.View'
    ],

    iconCls: 'activity',
	title: 'Activity',
    tabConfig:{
		tooltip: 'Recent Activity'
    },

    ui: 'activity',
    cls: 'activity-view',
    plain: true,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {xtype: 'box', cls: 'view-title', autoEl: {}},
        {
            xtype: 'container',
            layout: 'fit',
            flex: 1,
            id: 'activity-tab-view',
            items: [
                {
                    xtype: 'secondary-tabpanel',
	                stateId: 'activity-side-view',
                    defaults: {xtype:'activity-panel'},
                    items: [
                        {title: 'Contacts', filter: 'notInCommunity'},
                        {title: 'Community', filter: 'inCommunity'}
                    ]
                }
            ]
        }
    ],


    initComponent: function(){
		var i;
	    if(isFeature('remove-history-tab')){
		    i = this.items[1].items[0].items;
		    i.unshift({ xtype: 'history-view' });
	    }

        this.callParent(arguments);
        this.store = Ext.getStore('Stream');
        this.mon(this.store,{
            add: this.updateNotificationCountFromStore
        });

        this.monitoredInstance = $AppConfig.userObject;
        this.mon($AppConfig.userObject, 'changed', this.updateNotificationCount, this);
    },


    afterRender: function(){
        this.callParent(arguments);

        this.mon(this, {
            scope: this,
            'deactivate': this.resetNotificationCount
        });
    },

    updateNotificationCountFromStore: function(store, records){
        var u = $AppConfig.userObject,
            newCount = 0,
            c = (u.get('NotificationCount') || 0);


        Ext.each(records, function(record){
            if(!/deleted/i.test(record.get('ChangeType'))){
                newCount++;
            }
        });

        c += newCount;

        //Update current notification of the userobject.
        u.set('NotificationCount', c);
        u.fireEvent('changed',u);
    },


    onAdded: function(){
        this.callParent(arguments);
        //sigh
        Ext.defer(function(){
            this.setNotificationCountValue(
                this.monitoredInstance.get('NotificationCount'));
        }, 1, this);
    },


    updateNotificationCount: function(u) {
        if(u !== this.monitoredInstance && u === $AppConfig.userObject){
            this.mun(this.monitoredInstance,'changed', this.updateNotificationCount,this);
            this.monitoredInstance = u;
            this.mon(this.monitoredInstance,'changed', this.updateNotificationCount,this);
        }
        this.setNotificationCountValue(u.get('NotificationCount'));
    },


    resetNotificationCount: function(){
	    try {
            $AppConfig.userObject.saveField('NotificationCount', 0);
	    }
	    catch(e){
		    console.warn('Problem saving NotificationCount on active user account', $AppConfig.userObject);
	    }
        this.setNotificationCountValue(0);
    },


	addBadge: function(){
		var tab = this.tab;

		if(!tab.rendered){
			if(!tab.isListening('afterrender',this.addBadge,this)){
				tab.on('afterrender',this.addBadge,this);
			}
			return;
		}
		this.badge = Ext.DomHelper.append( tab.getEl(),{cls:'badge', html:tab.badge},true);
		delete tab.badge;
	},


    setNotificationCountValue: function(count){
	    var v = count || '&nbsp;',
			tab = this.tab;

	    if(!this.badge){
		    tab.badge = v;
		    this.addBadge();
		    return;
	    }

        this.badge.update(v);
    }
});

//Styles defined in _history-view.scss
Ext.define('NextThought.view.account.activity.ActivityTabs',{
    extend: 'Ext.container.Container',
    alias: 'widget.activity-tab-view',
    requires: [
        'NextThought.view.SecondaryTabPanel',
        'NextThought.view.account.activity.View'
    ],
    iconCls: 'activity',
    tooltip: 'Recent Activity',
    ui: 'activity',
    cls: 'activity-tab-view',
    plain: true,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {xtype: 'box', cls: 'view-title', autoEl: {html: 'Recent Activity'}},
        {
            xtype: 'container',
            layout: 'fit',
            flex: 1,
            id: 'activity-tab-view',
            items: [
                {
                    xtype: 'secondary-tabpanel',
                    defaults: {xtype:'activity-view'},
                    items: [
                        {title: 'Contacts', filter: 'notInCommunity'},
                        {title: 'Community', filter: 'inCommunity'}
                    ]
                }
            ]
        }
    ],


    initComponent: function(){
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
        $AppConfig.userObject.saveField('NotificationCount', 0);
        this.setNotificationCountValue(0);
    },


    setNotificationCountValue: function(count){
        this.tab.setText(count || '&nbsp;');
    }
});

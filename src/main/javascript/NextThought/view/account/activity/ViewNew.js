//Styles defined in _history-view.scss
Ext.define('NextThought.view.account.activity.ViewNew',{
    extend: 'Ext.container.Container',
    alias: 'widget.activity-view-new',
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
    mimeTypesMap: {
        'all': ['all'],
        'discussions': ['discussions','Thoughts'],
        'highlights': ['highlights'],
        'bookmarks': ['bookmarks'],
        'likes': ['likes'],
        'contact': ['contact']
    },

    filtersTpl: Ext.DomHelper.markup([{
            xtype: 'container',
            cls: 'activity-filters',
            cn: [
                {cls: 'tabs', cn:[
                    {cls: 'tab from', html: 'Only Me'},
                    {cls: 'tab types'}
                ]}
            ]
    }]),

    items: [
        {
            xtype: 'container',
            layout: 'fit',//change to card
            flex: 1,
            id: 'activity-tab-view',
            items: [  
                {xtype: 'history-view', cls: 'activity-panel history-panel'}, 
                {xtype: 'activity-panel', cls: 'activity-panel contacts-panel', filter: 'notInCommunity'},
                {xtype: 'activity-panel', cls: 'activity-panel community-panel', filter: 'inCommunity'}
            ]
        },
        {cls: 'filters-container'}
    ],


    initComponent: function(){
        var i;

        this.callParent(arguments);
        this.store = Ext.getStore('Stream');
        this.mon(this.store,{
            add: this.updateNotificationCountFromStore
        });

        this.fromMenu = Ext.widget('menu',{
            ui: 'nt',
            plain: true,
            showSeparator: false,
            shadow: false,
            frame: false,
            border: false,
            hideMode: 'display',
            title: 'SHOW ACTIVITY FROM',
            cls: 'menu from-menu',
            defaults: {
                ui: 'nt-menuitem',
                xtype: 'menucheckitem',
                group: 'from',
                plain: true,
                listeners: {
                    scope: this,
                    'checkchange': 'switchPanel'
                }
            },
            items: [
                {cls: 'option', text: 'Only Me', checked: true, isMe: true},
                {cls: 'option', text: 'My Contacts', checked: false, isContacts: true},
                {cls: 'option', text: 'Community', checked: false, isCommunity: true}
            ]
        });

        this.typesMenu = Ext.widget('menu',{
            ui: 'nt',
            plain: true,
            showSeparator: false,
            shadow: false,
            frame: false,
            border: false,
            hideMode: 'display',
            title: 'ACTIVITY TYPES',
            cls: 'menu types-menu',
            defaults: {
                ui: 'nt-menuitem',
                xtype: 'menucheckitem',
                plain: true,
                listeners:{
                    scope: this,
                    'checkchange': 'changeFilter'
                }
            },
            items: [
                {cls: 'option', text: 'Show All', checked: true, isAll: true, filter: 'all'},
                {cls: 'option', text: 'Discussions & Thoughts', checked: false, isDiscussions: true, filter: 'discussions'},
                {cls: 'option', text: 'Highlights', checked: false, isHighlights: true, filter: 'highlights'},
                {cls: 'option', text: 'Bookmarks', checked: false, isBookmarks: true, filter: 'bookmarks'},
                {cls: 'option', text: 'Likes', checked: false, isLikes: true, filter: 'likes'},
                {cls: 'option', text: 'Contact Requests', checked: false, isContact: true, filter: 'contact'}
            ]
        });

        this.filters = ['all'];
        this.activePanel = 'history';
        this.monitoredInstance = $AppConfig.userObject;
        this.mon($AppConfig.userObject, 'changed', this.updateNotificationCount, this);
    },


    afterRender: function(){
        this.callParent(arguments);

        this.mon(this, {
            scope: this,
            'deactivate': 'resetNotificationCount'
        });

        this.el.down('.filters-container').dom.innerHTML = this.filtersTpl;
        //this.switchPanel('history');
        this.mon(this.el.down('.filters-container'),{
            scope: this,
            'click': 'handleClick'
        });

        this.mon(this.fromMenu, {
            scope: this,
            'hide': function(){
                this.el.down('.filters-container .activity-filters .tabs .from').removeCls('selected');
            }
        });

        this.mon(this.typesMenu, {
            scope: this,
            'hide': function(){
                this.el.down('.filters-container .activity-filters .tabs .types').removeCls('selected');
            }
        });

        this.fromMenu.show().hide();
    },

    switchPanel: function(item){
        var tab = this.el.down('.filters-container .activity-filters .tabs .from');
        console.log('Swithing panels');
        this.el.down('.history-panel').hide();
        this.el.down('.contacts-panel').hide();
        this.el.down('.community-panel').hide();

        if(item.isMe){
            this.el.down('.history-panel').show();
            this.activePanel = 'history';
            tab.update('Only Me');
        }else if(item.isContacts){
            this.el.down('.contacts-panel').show();
            this.activePanel = 'contacts';
            tab.update('My Contacts');
        }else if(item.isCommunity){
            this.el.down('.community-panel').show();
            this.activePanel = 'community';
            tab.update('Community');
        }
    },

    changeFilter: function(item){
        this.filters = this.filters || [];

        if(Ext.Array.contains(this.filters, item.filter)){
            Ext.Array.remove(this.filters, item.filter);
        }else{
            this.filters.push(item.filter);
        }

        this.applyFilters(this.filters);
    },

    applyFilters: function(filter){
        var filters = [], filterGroup;

        Ext.Array.each(filter || this.filters, function(item){
            filters.push(new NextThought.Filter('MimeType', NextThought.Filter.OPERATION_INCLUDE, this.mimeTypesMap[item]));
        }, this);

        filterGroup = new NextThought.FilterGroup(this.id, NextThought.FilterGroup.OPERATION_UNION, filters);

        if(this.activePanel === 'history'){
            this.down('history-view')
        }else if(this.activePanel === 'contacts'){
            this.down('activity-panel[filter=notInCommunity]')
        }else{
            this.down('activity-panel[filter=inCommunity]')
        }
    },

    handleClick: function(e){
        if(e.getTarget('.from')){
            this.showFromMenu();
        }

        if(e.getTarget('.types')){
            this.showTypesMenu();
        }
        
        this.hidingFrom && delete this.hidingFrom;
        this.hidingTypes && delete this.hidingTypes;
    },

    showTypesMenu: function(){
        var tabSelector = '.filters-container .activity-filters .tabs';
        
        if(this.showingTypeMenu){
            delete this.showingTypeMenu; 
            return;
        }

        
        this.el.down(tabSelector+' .types').addCls('selected');
        this.typesMenu.showBy(this.el.down('.filters-container'), 'bl-tl', [0, -40]);
        this.showingTypeMenu = true;
    },

    showFromMenu: function(){
        var tabSelector = '.filters-container .activity-filters .tabs .from';
                
       if(this.fromMenu.isVisible()){
            this.fromMenu.hide();
            return;
       }

        this.el.down(tabSelector).addCls('selected');
        this.fromMenu.showBy(this.el.down('.filters-container'), 'bl-tl', [0, -39]);
        this.showingFromMenu = true;
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
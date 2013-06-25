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
        'discussions': ['forums.personalblogcomment', 'forums.personalblogentrypost','forums.communityheadlinepost', 'forums.generalforumcomment'],
        'notes': ['highlight', 'note'],
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
                {xtype: 'history-view', cls: 'activity-panel history-panel', filter:'onlyMe'},
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
                {cls: 'option', text: 'Only Me', checked: true, isMe: true, tabFilter:'onlyMe'},
                {cls: 'option', text: 'My Contacts', checked:false, isContacts: true, tabFilter: 'notInCommunity'},
                {cls: 'option', text: 'Community', checked: false, isCommunity: true, tabFilter: 'notInCommunity'}
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
                {cls: 'option', text: 'Discussions & Thoughts', filter: 'discussions'},
                {cls: 'option', text: 'Highlights & Notes', filter: 'notes'},
                {cls: 'option', text: 'Bookmarks', filter: 'bookmarks'},
                {cls: 'option', text: 'Likes', filter: 'likes'},
                {cls: 'option', text: 'Contact Requests', filter: 'contact'}
            ]
        });

        this.filters = ['all'];
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

	    //FIXME: Have a better way of setting/getting the initial selected panel.
	    this.selectedPanel = this.down('[filter=onlyMe]');
	    this.fromMenu.show().hide();
    },

    switchPanel: function(item){
	    var activePanel = this.selectedPanel,
		    newPanel = this.getActivePanel(),
		    newTab = this.fromMenu.down('menuitem[checked]'),
		    tab = this.el.down('.filters-container .activity-filters .tabs .from');

	    if(activePanel === newPanel){ return;}
	    if(activePanel){ activePanel.el.hide();}

	    this.selectedPanel = newPanel;
	    tab.update(newTab.text);
	    newPanel.el.show();
    },

	getActivePanel: function(){
		var selectedTab = this.fromMenu.down('menuitem[checked]'),
			v = selectedTab && selectedTab.tabFilter;
		return v ? this.down('[filter='+v+']') : null;
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
	    var menu = this.typesMenu,
		    allItems = menu.query('menuitem'),
		    Filter = NextThought.Filter,
		    everything = menu.down('[isAll]').checked, me = this,
		    activePanel = this.getActivePanel();

	    this.modelFilter = new NextThought.FilterGroup(menu.getId(),NextThought.FilterGroup.OPERATION_UNION);

	    Ext.each(allItems, function(item){
		    var models = me.mimeTypesMap[item.filter];
		    if ((everything || item.checked) && models) {
			    Ext.Array.each(Ext.Array.from(models), function(m){
				    this.modelFilter.addFilter(new Filter('MimeType', Filter.OPERATION_INCLUDE, 'application/vnd.nextthought.'+m));
			    }, this);
		    }
	    }, this);

		if(activePanel && activePanel.applyFilters){
	       activePanel.applyFilters(this.modelFilter);
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
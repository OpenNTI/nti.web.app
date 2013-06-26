//Styles defined in _history-view.scss
Ext.define('NextThought.view.account.activity.ViewNew',{
    extend: 'Ext.container.Container',
    alias: 'widget.activity-view-new',
    requires: [
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

    filtersTpl: Ext.DomHelper.createTemplate(
	    { cls: 'filters-container', cn:{
            cls: 'activity-filters', cn: [
                {cls: 'tabs', cn:[
                    {cls: 'tab from', html: 'Only Me'},
                    {cls: 'tab types'}
                ]}
            ]}
	    }
    ),


	layout: {
		type:'card',
		deferredRender: true
	},
    id: 'activity-tab-view',
    activeItem: 0,
    items: [
        {xtype: 'user-history-panel', filter:'onlyMe'},
        {xtype: 'activity-panel', filter: 'notInCommunity'},
        {xtype: 'activity-panel', filter: 'inCommunity'}
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
                {cls: 'option', text: 'Community', checked: false, isCommunity: true, tabFilter: 'inCommunity'}
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
                    'beforecheckchange':function(item, checked){ return checked || item.allowUncheck!==false; },
                    'checkchange': 'changeFilter'
                }
            },
            items: [
                {cls: 'option', text: 'Show All', checked: true, allowUncheck: false, isAll: true, filter: 'all'},
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

	    var filterEl = this.filtersTpl.append(this.el,null,true);

        //this.switchPanel('history');
        this.mon(filterEl,{
            scope: this,
            'click': 'handleClick'
        });

        this.mon(this.fromMenu, {
            scope: this,
            'hide': function(){
                filterEl.down('.activity-filters .tabs .from').removeCls('selected');
            }
        });

        this.mon(this.typesMenu, {
            scope: this,
            'hide': function(){
                filterEl.down('.activity-filters .tabs .types').removeCls('selected');
            }
        });

        this.applyFilters(['all']);

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
	    this.getLayout().setActiveItem(newPanel);
    },

	getActivePanel: function(){
		var selectedTab = this.fromMenu.down('menuitem[checked]'),
			v = selectedTab && selectedTab.tabFilter;
		return v ? this.down('[filter='+v+']') : null;
	},

    changeFilter: function(item){
        var allChecked = true, allUnchecked = true,
            allItems = this.typesMenu.query('menuitem');

        function uncheck(items){
            Ext.Array.each(items, function(i){
                if(!i.isAll){
                    i.setChecked(false, true);
                }
            })
        }

        if(item.checked){
            if(item.isAll){
                uncheck(allItems);
            }else{
                /*Ext.Array.each(allItems, function(i){
                    if(!i.isAll){
                        allChecked = allChecked && i.checked;
                    }
                });

                if(allChecked){
                    uncheck(allItems);
                    this.typesMenu.query('[isAll]')[0].setChecked(true,true);
                }else{
                    this.typesMenu.query('[isAll]')[0].setChecked(false,true);
                }*/
                this.typesMenu.query('[isAll]')[0].setChecked(false, true);
            }
        }else{
            Ext.Array.each(allItems, function(i){
                allUnchecked = allUnchecked && !i.checked;
            });

            if(allUnchecked){
                item.setChecked(true,true);
            }
        }

        this.applyFilters()
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
    },

    showTypesMenu: function(){
        var tabSelector = '.filters-container .activity-filters .tabs';
        
        if(this.showingTypeMenu){
            delete this.showingTypeMenu; 
            return;
        }

        
        this.el.down(tabSelector+' .types').addCls('selected');
        this.typesMenu.showBy(this.el.down('.filters-container'), 'bl-tl', [0, 0]);
        this.showingTypeMenu = true;
    },

    showFromMenu: function(){
        var tabSelector = '.filters-container .activity-filters .tabs .from';
                
       if(this.fromMenu.isVisible()){
            this.fromMenu.hide();
            return;
       }

        this.el.down(tabSelector).addCls('selected');
        this.fromMenu.showBy(this.el.down('.filters-container'), 'bl-tl', [0, 0]);
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
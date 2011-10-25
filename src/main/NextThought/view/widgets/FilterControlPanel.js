
Ext.define('NextThought.view.widgets.FilterControlPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.filter-control',
	requires: [
			'Ext.form.field.Checkbox',
            'NextThought.proxy.UserDataLoader'
			],

	width: MIN_SIDE_WIDTH,
	border: false,
    items: [{
		xtype: 'form', layout: 'anchor', cls: 'filter-controls',
		border: false, defaults:{border:false, anchor: '100%'}
	}],

	constructor: function(){
		this.addEvents('filter-changed','filter-control-loaded');
		this.callParent(arguments);
	},

	initComponent: function(){
   		this.callParent(arguments);
   		this.setWidth(MIN_SIDE_WIDTH);
        this.store = UserDataLoader.getFriendsListsStore();
        this.store.on('load', this.reload, this);
	},
	
	reload: function(store, groups, success, ops){
        this.addGroups(groups);
	},
	
	
	addGroups : function(){
        var form = this.items.get(0);
        form.removeAll();

        form.add({ border: false,html:'Who:', cls: 'sidebar-header'});

        form.add({
            border: false,
            boxLabel: 'All',
            cls: 'no-filter',
            name: 'allgroupsbutton',
            xtype: 'checkbox'
        });

		form.add({
            border: false,
			cls: 'user-filter',
			usergroup: true,
			xtype:'checkboxfield',
			boxLabel: 'Me',
			isMe: true
		});

        this.store.each(
			function(v){
                var hasAt = /@/.test(v.get('Username'));

				form.add({
                    border: false,
					cls: hasAt? 'user-group' : 'system-group',
					usergroup: true,
					xtype:'checkboxfield',
					boxLabel: v.get('realname'),	
					record: v
				});
			},
			this
		);
		
		form.add({ border: false,html:'What:', cls: 'sidebar-header'});
		
		form.add({
            border: false,
			cls: 'no-filter',
			name: 'alltypesbutton',
			xtype: 'checkboxfield',
			boxLabel: 'All'
		});
		
		form.add({ xtype:'checkbox', cls: 'type-filter highlight', boxLabel: 'Highlights', model: 'NextThought.view.widgets.annotations.Highlight' });
		form.add({ xtype:'checkbox', cls: 'type-filter note', boxLabel: 'Notes', model: 'NextThought.view.widgets.annotations.Note' });

		this.fireEvent('filter-control-loaded',this.getId());
        this.doComponentLayout();
        this.doLayout();
	}
});

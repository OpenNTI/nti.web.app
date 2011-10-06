
Ext.define('NextThought.view.widgets.FilterControlPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.filter-control',
	requires: [
			'Ext.form.field.Checkbox',
            'NextThought.proxy.UserDataLoader'
			],

	width: MIN_SIDE_WIDTH,
	border: false,
    items: [{xtype: 'form', border: false, defaults:{border:false}}],

	constructor: function(){
		this.addEvents('filter-changed','filter-control-loaded');
		this.callParent(arguments);
	},

	initComponent: function(){
   		this.callParent(arguments);
   		this.setWidth(MIN_SIDE_WIDTH);
        UserDataLoader.getFriendsListsStore().on('load', this.reload, this);
	},
	
	reload: function(store, groups, success, ops){
        this.addGroups(groups);
	},
	
	
	addGroups : function(groups){
        var form = this.items.get(0);
        form.removeAll();

        form.add({ border: false,html:'Who:', cls: 'sidebar-header'});

        form.add({
            border: false,
            boxLabel: 'All',
            cls: 'x-all-filter-btn',
            name: 'allgroupsbutton',
            xtype: 'checkbox'
        });

		form.add({
            border: false,
			cls: 'user-group',
			usergroup: true,
			xtype:'checkboxfield',
			boxLabel: 'Me',
			isMe: true
		});

		Ext.each(groups,
			function(v){
				form.add({
                    border: false,
					cls: 'user-group',
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
			cls: 'x-all-filter-btn',
			name: 'alltypesbutton',
			xtype: 'checkboxfield',
			boxLabel: 'All'
		});
		
		form.add({ xtype:'checkbox', boxLabel: 'Highlights', model: 'NextThought.view.widgets.annotations.Highlight' });
		form.add({ xtype:'checkbox', boxLabel: 'Notes', model: 'NextThought.view.widgets.annotations.Note' });

		this.fireEvent('filter-control-loaded',this.getId());
        this.doComponentLayout();
        this.doLayout();
	}
});
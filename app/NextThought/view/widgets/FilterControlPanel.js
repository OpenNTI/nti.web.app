
Ext.define('NextThought.view.widgets.FilterControlPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.filter-control',
	requires: [
			'Ext.form.field.Checkbox',
            'NextThought.proxy.UserDataLoader'
			],

	width: MIN_SIDE_WIDTH,
	border: false,
	defaults: {border: false, defaults:{border:false}},
	
	constructor: function(){
		this.addEvents('filter-changed','filter-control-loaded');
		this.callParent(arguments);
	},

	initComponent: function(){
   		this.callParent(arguments);
   		this.setWidth(MIN_SIDE_WIDTH);
   		
   		this.reload();
	},
	
	reload: function(){
		UserDataLoader.getGroups({
   			scope: this,
   			success: this.addGroups
   		});
	},
	
	
	addGroups : function(groups){
        this.removeAll();
        this.removeAll();
		var p = 'auto auto auto 10px',
            form = Ext.create('Ext.form.Panel',{border: false});

//        this.add({ border: false,html:'&nbsp;', padding: 10});
        this.add(form);

        form.add({ border: false,html:'Who:', cls: 'sidebar-header'});

        form.add({
            boxLabel: 'All',
            cls: 'x-all-filter-btn',
            name: 'allgroupsbutton',
            xtype: 'checkbox'
        });

		form.add({
			padding: p,
			cls: 'user-group',
			usergroup: true,
			xtype:'checkboxfield',
			boxLabel: 'Me',
			isMe: true
		});

		Ext.each(groups,
			function(v){
				form.add({
					padding: p,
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
			cls: 'x-all-filter-btn',
			name: 'alltypesbutton',
			xtype: 'checkboxfield',
			boxLabel: 'All'
		});
		
		form.add({ xtype:'checkbox', padding: p, boxLabel: 'Highlights', model: 'NextThought.view.widgets.Highlight' });
		form.add({ xtype:'checkbox', padding: p, boxLabel: 'Notes', model: 'NextThought.view.widgets.Note' });

		this.fireEvent('filter-control-loaded',this.getId());
	}
});
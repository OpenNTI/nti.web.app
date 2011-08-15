
Ext.define('NextThought.view.widgets.FilterControlPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.filter-control',
	requires: [
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
		var p = 'auto auto auto 10px';
		this.add({ border: false,html:'&nbsp;', padding: 30});
		
		var form = Ext.create('Ext.form.Panel',{border: false});
		form.add({ border: false,html:'<div>Who:</div><hr size=1/>', padding: '10px auto'});		
		form.add({
			cls: 'x-all-filter-btn',
			name: 'allgroupsbutton',
			xtype: 'checkbox',
			boxLabel: 'All'
		});
		
		form.add({
			padding: p,
			cls: 'user-group',
			usergroup: true,
			xtype:'checkbox',
			boxLabel: 'Me',
			isMe: true	
		});
		
		Ext.each(groups, 
			function(v){
				form.add({
					padding: p,
					cls: 'user-group',
					usergroup: true,
					xtype:'checkbox',
					boxLabel: v.get('realname'),	
					record: v
				});
			},
			this
		);
		
	
		form.add({ border: false,html:'<div>What:</div><hr size=1/>', padding: '10px auto'});
		
		form.add({
			cls: 'x-all-filter-btn',
			name: 'alltypesbutton',
			xtype: 'checkbox',
			boxLabel: 'All'
		});
		
		form.add({ xtype:'checkbox', padding: p, boxLabel: 'Highlights', model: 'NextThought.view.widgets.Highlight' });
		form.add({ xtype:'checkbox', padding: p, boxLabel: 'Notes', model: 'NextThought.view.widgets.Note' });
		
		this.add(form);
		
		
		this.fireEvent('filter-control-loaded',this.getId());
	}
});
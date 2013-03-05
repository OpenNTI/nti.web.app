Ext.define('NextThought.view.menus.BlogTogglePublish', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.blog-toggle-publish',

	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	parentItem: this,
	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		group: 'publish',
		handler: function(item){
			item.up('.menu').handleClick(item);
		}
	},

	items:[{
			text: 'Public',
			published: true
		},
		{
			text: 'Only Me',
			published: false
		}
	],

	initComponent: function(config){
		this.callParent(arguments);
	},

	updateFromRecord: function(rec){
		if(rec && rec.isPublished()){
			this.down('[published=true]').setChecked(true, true);
		}else{
			this.down('[published=false]').setChecked(true, true);
		}
	},

	handleClick: function(item){
		var action = item.published;
		if(this.record.isPublished() === action){ return; }

		this.record.publish(this);
	}
});

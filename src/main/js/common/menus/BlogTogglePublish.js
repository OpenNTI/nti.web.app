export default Ext.define('NextThought.common.menus.BlogTogglePublish', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.blog-toggle-publish',

	parentItem: this,
	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		group: 'publish',
		handler: function(item) {
			item.up('.menu').handleClick(item);
		}
	},

	items: [{
			text: getString('NextThought.view.menus.BlogTogglePublish.publish'),
			published: true
		},
		{
			text: getString('NextThought.view.menus.BlogTogglePublish.onlyme'),
			published: false
		}
	],

	initComponent: function(config) {
		this.callParent(arguments);
	},

	updateFromRecord: function(rec) {
		if (rec && rec.isPublished()) {
			this.down('[published=true]').setChecked(true, true);
		}else {
			this.down('[published=false]').setChecked(true, true);
		}
	},

	handleClick: function(item) {
		var action = item.published;
		if (this.record.isPublished() === action) { return; }

		this.record.publish(this.owner || this);
	}
});

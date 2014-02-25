Ext.define('NextThought.view.forums.topic.Navigation', {
	extend: 'Ext.container.Container',
	alias: 'widget.forums-topic-nav',

	requires: [
		'NextThought.view.forums.topic.parts.NavGrid'
	],

	cls: 'topic-nav forum-nav',
	layout: 'auto',
	plain: true,
	border: false,
	frame: false,

	items: [{
		xtype: 'forums-topic-nav-grid'
	}],


	initComponent: function() {
		this.callParent(arguments);

		this.grid = this.down('forums-topic-nav-grid');

		this.relayEvents(this.grid, ['update-body', 'new-topic']);
	},


	setCurrent: function() {
		this.grid.setCurrent.apply(this.grid, arguments);
	},


	setActiveRecord: function() {
		this.grid.setActiveRecord.apply(this.grid, arguments);
	},


	updateGridHeight: function(h) {
		this.grid.setHeight(h);
	}
});

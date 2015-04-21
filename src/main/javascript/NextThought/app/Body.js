Ext.define('NextThought.app.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',

	requires: [
		'NextThought.app.library.Index'
	],

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.History'
	},

	layout: 'card',

	cls: 'main-body',

	items: [
		{xtype: 'box', autoEl: {html: 'Body'}}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.addRoute('/library', this.setLibraryActive.bind(this));

		this.addDefaultRoute(this.setLibraryActive.bind(this));
	},


	setLibraryActive: function(route, subRoute) {

	}
});

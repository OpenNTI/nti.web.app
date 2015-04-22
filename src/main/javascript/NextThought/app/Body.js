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

	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.initHistoryState();

		this.addRoute('/library', this.setLibraryActive.bind(this));

		this.addDefaultRoute(this.setLibraryActive.bind(this));
	},


	setActiveCmp: function(xtype) {
		var cmp = this.down(xtype);

		if (!cmp) {
			cmp = Ext.widget(xtype);
			this.addChildState(cmp);
		}

		this.getLayout().setActiveItem(cmp);

		return cmp;
	},


	setLibraryActive: function(route, subRoute) {
		var library = this.setActiveCmp('library-view-container');

		library.handleRoute(subRoute);
	}
});

Ext.define('NextThought.app.library.Home', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-home',

	requires: [
		'NextThought.app.library.admin.Current',
		'NextThought.app.library.communities.Current',
		'NextThought.app.library.content.Current',
		'NextThought.app.library.courses.Current'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	cls: 'library-homepage',

	items: [{xtype: 'box', loadingCmp: true, cls: 'loading', html: 'Loading...'}],


	initComponent: function() {
		this.callParent(arguments);

		var me = this,
			loadingCmp = me.down('[loadingCmp]'),
			cmps = [
				NextThought.app.library.communities.Current,
				NextThought.app.library.courses.Current,
				NextThought.app.library.admin.Current,
				NextThought.app.library.content.Current
			];

		Promise.all(cmps.map(function(c) {
			return c.shouldShow();
		}))
			.then(function(showing) {
				me.remove(loadingCmp);
				cmps.forEach(function(cmp, i) {
					if (showing[i]) {
						me.add({xtype: cmp.xtype});
					}
				});
			})
			.fail(function() {
				me.remove(loadingCmp);

				me.add({xtype: 'box', autoEl: 'Failed to Load Library'});
			});
	}
});

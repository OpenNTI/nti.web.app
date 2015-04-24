Ext.define('NextThought.app.library.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-view-container',

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	requires: [
		'NextThought.app.library.Actions',
		'NextThought.app.library.StateStore',
		'NextThought.app.library.courses.StateStore',
		'NextThought.app.library.content.StateStore'
	],


	layout: 'none',

	items: [
		{xtype: 'box', autoEl: {html: 'library'}}
	]
});

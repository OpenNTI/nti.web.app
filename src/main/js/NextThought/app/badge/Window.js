export default Ext.define('NextThought.app.badge.Window', {
	extend: 'Ext.container.Container',

	requires: [
		'NextThought.app.windows.StateStore',
		'NextThought.model.openbadges.Badge',
		'NextThought.app.badge.components.Badge',
		'NextThought.app.windows.components.Header'
	],

	layout: 'none',

	cls: 'badge-window',

	initComponent: function() {
		this.callParent(arguments);

		this.add({xtype: 'window-header', doClose: this.doClose.bind(this)});

		this.add({xtype: 'badge-info', badge: this.record});
	}

}, function() {
	NextThought.app.windows.StateStore.register(NextThought.model.openbadges.Badge.mimeType, this);
	NextThought.app.windows.StateStore.registerCustomResolver(NextThought.model.openbadges.Badge.mimeType, function(id, raw) {
		var workspace = Service.getWorkspace('Badges'),
			link = Service.getLinkFrom(workspace.Links, 'OpenBadges');

		return Service.request('/' + Globals.trimRoute(link) + '/' + raw)
			.then(function(badge) {
				return ParseUtils.parseItems(badge)[0];
			});
	});
});

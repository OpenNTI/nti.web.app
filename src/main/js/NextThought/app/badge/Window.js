Ext.define('NextThought.app.badge.Window', {
	extend: 'Ext.container.Container',

	requires: [
		'NextThought.app.windows.StateStore',
		'NextThought.model.openbadges.Badge',
		'NextThought.app.badge.components.Badge',
		'NextThought.app.windows.components.Header'
	],

	layout: 'none',

	initComponent: function() {
		this.callParent(arguments);

		this.add({xtype: 'window-header', doClose: this.doClose.bind(this)});

		this.add({xtype: 'badge-info', badge: this.record});
	}

}, function() {
	NextThought.app.windows.StateStore.register(NextThought.model.openbadges.Badge.mimeType, this);
	NextThought.app.windows.StateStore.registerCustomResolver(NextThought.model.openbadges.Badge.mimeType, function(id, raw) {
		raw = decodeURIComponent(raw);

		return Service.request('/dataserver2/OpenBadges/' + raw)
			.then(function(badge) {
				return ParseUtils.parseItems(badge)[0];
			});
	});
});

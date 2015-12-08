Ext.define('NextThought.app.course.overview.components.editing.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing',

	requires: [
		'NextThought.app.course.overview.components.editing.outline.Index',
		'NextThought.app.course.overview.components.editing.window.Window'
	],


	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	items: [],


	editOutlineNode: function(record) {
		this.removeAll(true);

		var Outline = NextThought.app.course.overview.components.editing.outline.Index,
			cmp;

		if (Outline.canHandle(record.mimeType)) {
			cmp = this.add({xtype: 'overview-editing-outline', record: record, bundle: this.bundle});
		}

		if (cmp) {
			return cmp.onceLoaded ? cmp.onceLoaded() : Promise.resolve();
		}

		return Promise.reject('No cmp to handle record');
	}
});

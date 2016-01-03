Ext.define('NextThought.app.course.overview.components.editing.outline.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-outline',

	requires: [
		'NextThought.app.course.overview.components.editing.outline.outlinenode.Index',
		'NextThought.app.course.overview.components.editing.outline.calendarnode.Index',
		'NextThought.app.course.overview.components.editing.outline.contentnode.Index'
	],


	mixins: {
		Router: 'NextThought.mixins.Router'
	},


	statics: {
		canHandle: function(mimeType) {
			return !!this.HANDLES[mimeType];
		},


		getTypeFor: function(mimeType) {
			return this.HANDLES[mimeType];
		},


		initRegistry: function() {
			var base = NextThought.app.course.overview.components.editing.outline,
				types = [
					base.outlinenode.Index,
					base.calendarnode.Index,
					base.contentnode.Index
				];

			this.HANDLES = types.reduce(function(acc, type) {
				var supported = type.getSupported && type.getSupported();

				if (!Array.isArray(supported)) {
					supported = [supported];
				}

				supported.forEach(function(support) {
					acc[support] = type;
				});

				return acc;
			}, {});
		}
	},

	cls: 'outline-node-editing',
	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		var record = this.record,
			cmp = this.self.getTypeFor(record.mimeType);

		if (!cmp) { console.error('No cmp to handle record: ', record); }

		this.activeComponent = this.add(cmp.create({
			record: record,
			parentRecord: this.parentRecord,
			bundle: this.bundle,
			afterDelete: this.onDelete.bind(this),
			navigateToOutlineNode: this.navigateToOutlineNode,
			afterDelete: this.onDelete.bind(this)
		}));
	},


	onceLoaded: function() {
		if (this.activeComponent && this.activeComponent.onceLoaded) {
			return this.activeComponent.onceLoaded();
		}

		return Promise.resolve();
	},


	onDelete: function() {
		if (this.afterDelete) {
			this.afterDelete();
		}
	}
}, function() {
	this.initRegistry();
});

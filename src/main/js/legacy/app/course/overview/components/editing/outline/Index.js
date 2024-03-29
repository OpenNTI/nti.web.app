const Ext = require('@nti/extjs');

const OutlinenodeIndex = require('./outlinenode/Index');
const CalendarnodeIndex = require('./calendarnode/Index');
const ContentnodeIndex = require('./contentnode/Index');

require('internal/legacy/mixins/Router');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.outline.Index',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.overview-editing-outline',

		mixins: {
			Router: 'NextThought.mixins.Router',
		},

		statics: {
			canHandle: function (mimeType) {
				return !!this.HANDLES[mimeType];
			},

			getTypeFor: function (mimeType) {
				return this.HANDLES[mimeType];
			},

			initRegistry: function () {
				const types = [
					OutlinenodeIndex,
					CalendarnodeIndex,
					ContentnodeIndex,
				];

				this.HANDLES = types.reduce(function (acc, type) {
					var supported = type.getSupported && type.getSupported();

					if (!Array.isArray(supported)) {
						supported = [supported];
					}

					supported.forEach(function (support) {
						acc[support] = type;
					});

					return acc;
				}, {});
			},
		},

		cls: 'outline-node-editing',
		layout: 'none',
		items: [],

		initComponent: function () {
			this.callParent(arguments);

			var record = this.record,
				cmp = this.self.getTypeFor(record.mimeType);

			if (!cmp) {
				console.error('No cmp to handle record: ', record);
			}

			this.activeComponent = this.add(
				cmp.create({
					record: record,
					parentRecord: this.parentRecord,
					outline: this.outline,
					outlineInterface: this.outlineInterface,
					bundle: this.bundle,
					afterDelete: this.onDelete.bind(this),
					navigateToOutlineNode: this.navigateToOutlineNode,
					navigate: this.navigate,
				})
			);
		},

		onceLoaded: function () {
			if (this.activeComponent && this.activeComponent.onceLoaded) {
				return this.activeComponent.onceLoaded();
			}

			return Promise.resolve();
		},

		onDelete: function () {
			if (this.afterDelete) {
				this.afterDelete();
			}
		},

		onRouteDeactivate() {
			if (this.activeComponent) {
				this.activeComponent.onRouteDeactivate();
			}
		},
	},
	function () {
		this.initRegistry();
	}
);

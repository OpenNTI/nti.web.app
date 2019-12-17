const Ext = require('@nti/extjs');

require('./Type');

async function getAvailableTypes (types, bundle) {
	const availableTypes = await Promise.all(
		types.map(async (type) => {
			const available = type.isAvailable ? await type.isAvailable(bundle) : true;

			return available ? type : null;
		})
	);

	return availableTypes.filter(Boolean);
}


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.creation.TypeList', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-typelist',
	cls: 'new-type-list',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);
		this.addTypes();
	},


	async addTypes () {
		const showEditor = this.showEditorForType.bind(this);
		const parentRecord = this.parentRecord;
		const rootRecord = this.rootRecord;
		const bundle = this.bundle;

		this.types = this.types || [];

		if (this.types.length === 0) {
			//TODO: add empty state? not sure how you would end up here...
			return;
		}

		const availableTypes = await getAvailableTypes(this.types, bundle);

		this.add(availableTypes.map((type) => {
			/**
			 * Adding a divider for cross-selling quotes
			 */

			if (type.isDivider) {
				return {
					xtype: 'box',
					autoEl: { cls: 'quote-header', html: type.text }
				};
			}

			return {
				xtype: 'overview-editing-type',
				showEditor: showEditor,
				typeConfig: type,
				parentRecord: parentRecord,
				rootRecord: rootRecord
			};
		}, []));

	}
});

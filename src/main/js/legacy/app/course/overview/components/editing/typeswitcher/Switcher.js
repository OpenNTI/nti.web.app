const Ext = require('extjs');

require('../creation/ChildCreation');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.typeswitcher.Switcher', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
	alias: 'widget.outline-editing-type-switcher',

	title: 'Pick New Type',

	initComponent () {
		this.callParent(arguments);

		const index = this.parentRecord && this.parentRecord.indexOfId(this.record.getId());

		this.lockedPosition = {
			parentRecord: this.parentRecord,
			index: index
		};
	},


	getTypes () {
		const types = this.group ? this.group.getTypes() : [];
		const {record} = this;

		//Filter out the editor for the current type
		return types.filter((type) => {
			const {editor} = type;

			return editor && !editor.getEditorForRecord(record);
		});
	},

	onSave () {}
});

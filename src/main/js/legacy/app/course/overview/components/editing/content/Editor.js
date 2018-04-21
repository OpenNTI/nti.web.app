const Ext = require('@nti/extjs');

const ParentSelection = require('./ParentSelection');

require('../Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',


	addParentSelection: function (record, parentRecord, rootRecord, onChange) {
		if (!rootRecord) { return null; }

		var items = rootRecord.get('Items');

		return this.add(new ParentSelection({
			selectionItems: items,
			selectedItem: parentRecord !== rootRecord ? parentRecord : null,
			parentRecord: parentRecord,
			lockedPosition: this.lockedPosition,
			rootRecord: rootRecord,
			editingRecord: record,
			scrollingParent: this.scrollingParent,
			onChange: onChange
		}));
	}
});

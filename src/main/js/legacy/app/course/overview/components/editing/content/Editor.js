var Ext = require('extjs');
var EditingEditor = require('../Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',


	addParentSelection: function (record, parentRecord, rootRecord, onChange) {
		if (!rootRecord) { return null; }

		var items = rootRecord.get('Items');

		return this.add(new NextThought.app.course.overview.components.editing.content.ParentSelection({
			selectionItems: items,
			selectedItem: parentRecord !== rootRecord ? parentRecord : null,
			parentRecord: parentRecord,
			rootRecord: rootRecord,
			editingRecord: record,
			scrollingParent: this.scrollingParent,
			onChange: onChange
		}));
	}
});

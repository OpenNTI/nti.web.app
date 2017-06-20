const Ext = require('extjs');

const OutlinenodeInlineEditor = require('./outlinenode/InlineEditor');

require('../parentselection/Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.ParentSelection', {
	extend: 'NextThought.app.course.overview.components.editing.parentselection.Index',
	alias: 'widget.overview-editing-outline-parentselection',
	label: 'Unit: ',

	parseItemData: function (item) {
		return {
			cls: 'outline-item',
			ntiid: item.getId(),
			label: item.getTitle && item.getTitle()
		};
	},

	getEditor: function () {
		return OutlinenodeInlineEditor;
	}
});

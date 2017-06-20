const Ext = require('extjs');

const OverviewgroupInlineEditor = require('./overviewgroup/InlineEditor');

require('../parentselection/Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.ParentSelection', {
	extend: 'NextThought.app.course.overview.components.editing.parentselection.Index',
	alias: 'widget.overview-editing-content-parentselection',
	label: 'Section:',

	parseItemData: function (item) {
		return {
			cls: 'group-item',
			ntiid: item.getId(),
			label: item.get('title'),
			color: item.get('accentColor')
		};
	},

	getEditor: function () {
		return OverviewgroupInlineEditor;
	}
});

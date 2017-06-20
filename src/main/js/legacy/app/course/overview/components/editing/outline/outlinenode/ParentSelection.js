const Ext = require('extjs');

require('../../parentselection/Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.ParentSelection', {
	extend: 'NextThought.app.course.overview.components.editing.parentselection.Index',
	alias: 'widget.overview-editing-outlinenode-parentselection',

	label: 'Outline:',

	parseItemData: function (item) {
		return {
			cls: 'outline-item',
			ntiid: item.getId(),
			label: item.getTitle && item.getTitle()
		};
	}
});

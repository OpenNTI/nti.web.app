Ext.define('NextThought.app.course.overview.components.editing.outline.ParentSelection', {
	extend: 'NextThought.app.course.overview.components.editing.parentselection.Index',
	alias: 'widget.overview-editing-outline-parentselection',


	label: 'Unit',


	parseItemData: function(item) {
		debugger;
		return {
			cls: 'outline-item',
			ntiid: item.getId(),
			label: item.getTitle && item.getTitle()
		};
	}
});

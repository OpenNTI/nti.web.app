export default Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.ParentSelection', {
	extend: 'NextThought.app.course.overview.components.editing.parentselection.Index',
	alias: 'widget.overview-editing-overviewgroup-parentselection',

	requires: [
		'NextThought.app.course.overview.components.editing.content.overviewgroup.InlineEditor'
	],

	label: 'Lesson:',

	parseItemData: function(item) {
		return {
			cls: 'lesson-overview-item',
			ntiid: item.getId(),
			label: item.getTitle()
		};
	}
});

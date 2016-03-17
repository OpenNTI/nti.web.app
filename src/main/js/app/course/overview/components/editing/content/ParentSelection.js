 export default Ext.define('NextThought.app.course.overview.components.editing.content.ParentSelection', {
	extend: 'NextThought.app.course.overview.components.editing.parentselection.Index',
	alias: 'widget.overview-editing-content-parentselection',

	requires: [
		'NextThought.app.course.overview.components.editing.content.overviewgroup.InlineEditor'
	],

	label: 'Section:',

	parseItemData: function(item) {
		return {
			cls: 'group-item',
			ntiid: item.getId(),
			label: item.get('title'),
			color: item.get('accentColor')
		};
	},


	getEditor: function() {
		return NextThought.app.course.overview.components.editing.content.overviewgroup.InlineEditor;
	}
});

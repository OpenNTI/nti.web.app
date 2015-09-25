export default Ext.define('NextThought.app.course.dashboard.components.tiles.AssignmentsList', {
	extend: 'NextThought.app.course.dashboard.components.tiles.BaseCmp',
	alias: 'widget.dashboard-assignments-list',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: 'Upcoming Assignment Due Dates'},
		{tag: 'tpl', 'for': 'assignments', cn: [
			{cls: 'item', cn: [
				{cls: 'title', html: '{title}'}
			]}
		]}
	]),


	beforeRender: function() {
		this.callParent(arguments);
	}
});

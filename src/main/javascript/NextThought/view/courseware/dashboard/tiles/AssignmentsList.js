Ext.define('NextThought.view.courseware.dashboard.tiles.AssignmentsList', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Base',
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

Ext.define('NextThought.view.courseware.dashboard.tiles.Assignment', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Base',
	alias: 'widget.dashboard-assignment',

	cls: 'assignment-tile',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: 'Assignment'},
		{cls: 'title', html: '{title}'}
	]),

	getRenderData: function() {
		return {
			title: this.record.get('title')
		};
	}
});

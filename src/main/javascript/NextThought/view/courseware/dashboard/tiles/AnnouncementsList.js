Ext.define('NextThought.view.courseware.dashboard.tiles.AnnouncementsList', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Base',
	alias: 'widget.dashboard-announcements-list',

	weight: 50,

	renderTpl: Ext.DomHelper.markup([
		{html: 'Announcements'}
	])
});

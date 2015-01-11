Ext.define('NextThought.view.courseware.dashboard.tiles.Announcements', {
	extend: 'Ext.view.View',
	alias: 'widget.dashboard-announcements',

	itemSelector: '.item',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{tag: 'tpl', 'for': '.', cn: [
			{cls: 'item'}
		]}
	))
});

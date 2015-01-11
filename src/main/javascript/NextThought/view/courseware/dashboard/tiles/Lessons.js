Ext.define('NextThought.view.courseware.dashboard.tiles.Lessons', {
	extend: 'Ext.view.View',
	alias: 'widget.dashboard-lessons',

	itemSelector: '.item',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{tag: 'tpl', 'for': '.', cn: [
			{cls: 'item'}
		]}
	)),

	initComponent: function() {}
});

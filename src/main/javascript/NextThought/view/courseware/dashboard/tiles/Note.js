Ext.define('NextThought.view.courseware.dashboard.tiles.Note', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Base',
	alias: 'widget.dashboard-note',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: 'Note'},
		{cls: 'title', html: '{title}'}
	]),


	getRenderData: function() {
		return {
			title: this.record.get('title')
		};
	}
});

Ext.define('NextThought.view.courseware.dashboard.tiles.Announcement', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Base',
	alias: 'widget.dashboard-announcement',

	cls: 'announcement-tile',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: 'Announcement - {label}'},
		{cls: 'title', html: '{title}'}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.record.get('title'),
			label: this.label
		});
	}
});

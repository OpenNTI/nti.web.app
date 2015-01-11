Ext.define('NextThought.view.courseware.dashboard.tiles.Topic', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Base',
	alias: 'widget.dashboard-topic',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: 'Topic'},
		{cls: 'title', html: '{title}'}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.record.get('headline').get('title')
		});
	}
});

Ext.define('NextThought.view.courseware.dashboard.tiles.TopicComment', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Base',
	alias: 'widget.dashboard-topic-comment',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: 'Topic Comment'},
		{cls: 'title', html: '{title}'}
	]),

	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.record.getBodyText()
		});
	}
});

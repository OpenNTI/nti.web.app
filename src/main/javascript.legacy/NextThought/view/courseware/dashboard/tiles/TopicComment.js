Ext.define('NextThought.view.courseware.dashboard.tiles.TopicComment', {
	extend: 'NextThought.view.courseware.dashboard.tiles.BaseCmp',
	alias: 'widget.dashboard-topic-comment',

	statics: {
		HEIGHT: 300
	},

	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: 'Topic Comment'},
		{cls: 'title', html: '{title}'}
	]),


	getRenderData: function() {
		return {
			title: this.record.getBodyText()
		};
	}
});

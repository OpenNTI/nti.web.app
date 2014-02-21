Ext.define('NextThought.view.forums.topic.parts.NavHeader', {
	extend: 'Ext.Component',
	alias: 'widget.forums-topic-nav-header',

	cls: 'topic-nav-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'new-topic', html: 'New Discussion'}
	]),


	renderSelectors: {
		newTopicEl: '.new-topic'
	},

	afterRender: function() {
		var me = this;

		me.callParent(arguments);

		me.mon(me.newTopicEl, 'click', function() {
			me.fireEvent('maybe-new-topic');
		});
	}

});

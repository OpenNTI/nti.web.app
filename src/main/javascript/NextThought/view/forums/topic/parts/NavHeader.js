Ext.define('NextThought.view.forums.topic.parts.NavHeader', {
	extend: 'Ext.Component',
	alias: 'widget.forums-topic-nav-header',

	cls: 'topic-nav-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'new-topic', html: '{{{NextThought.view.forums.topic.parts.NavHeader.new}}}'}
	]),


	renderSelectors: {
		newTopicEl: '.new-topic'
	},

	afterRender: function() {
		var me = this;

		me.callParent(arguments);

		if (me.shouldHide) {
			me.hideNewTopic();
		} else {
			me.mon(me.newTopicEl, 'click', function() {
				me.fireEvent('maybe-new-topic');
			});
		}
	},

	hideNewTopic: function() {
		if (!this.rendered) {
			this.shouldHide = true;
			return;
		}

		this.newTopicEl.destroy();
	}

});

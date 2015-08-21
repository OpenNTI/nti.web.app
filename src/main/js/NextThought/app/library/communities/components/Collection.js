Ext.define('NextThought.app.library.communities.components.Collection', {
	extend: 'Ext.view.View',
	alias: 'widget.library-communities-collection',

	mixins: {
		EllipsisText: 'NextThought.mixins.EllipsisText'
	},

	itemSelector: '.community-grid-item',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'ul', cls: 'library-grid', 'role': 'group', 'aria-label': 'communities', cn: [
			{tag: 'tpl', 'for': '.', cn: [
				{tag: 'li', cls: 'community-grid-item', cn: [
					'{[this.getAvatar(values)]}',
					{cls: 'title-container', cn: [
						{cls: 'title', html: '{displayName}'}
					]}
				]}
			]}
		]
	}), {
		getAvatar: function(model) {
			return NTIFormat.avatar(model);
		}
	}),


	initComponent: function() {
		this.callParent(arguments);

		this.on('refresh', 'truncateLabels', this);
	},


	truncateLabels: function() {
		var me = this;

		if (!me.el) {
			me.onceRendered.then(me.truncateLabels.bind(me));
			return;
		}

		wait(100).then(function() {
			var labels = me.el.select('.community-grid-item .title');

			labels.each(function(label) {
				me.truncateText(label.dom, null, true);
			});
		});
	}
});

const Ext = require('extjs');

const {toCSSClassName} = require('nti-lib-dom');

const NTIFormat = require('legacy/util/Format');
const {wait} = require('legacy/util/Promise');
require('legacy/mixins/EllipsisText');


module.exports = exports = Ext.define('NextThought.app.library.communities.components.Collection', {
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
						{cls: '{[this.getCls(values.displayName)]}', html: '{displayName}'}
					]}
				]}
			]}
		]
	}), {
		getCls (displayName) {
			return `title ${toCSSClassName(displayName)}`;
		},

		getAvatar: function (model) {
			return NTIFormat.avatar(model);
		}
	}),


	initComponent: function () {
		this.callParent(arguments);

		this.on({
			'refresh': this.truncateLabels.bind(this),
			select: this.handleSelect.bind(this)
		});
	},


	truncateLabels: function () {
		var me = this;

		if (!me.el) {
			me.onceRendered.then(me.truncateLabels.bind(me));
			return;
		}

		wait(100).then(function () {
			var labels = me.el.select('.community-grid-item .title');

			labels.each(function (label) {
				me.truncateText(label.dom, null, true);
			});
		});
	},

	handleSelect: function (selModel, record) {
		selModel.deselect(record);

		var node = this.getNodeByRecord(record);

		if (this.navigate) {
			this.navigate.call(this, record, node);
		}
	}
});

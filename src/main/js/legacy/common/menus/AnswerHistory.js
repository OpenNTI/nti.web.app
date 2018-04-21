const Ext = require('@nti/extjs');

const {getString} = require('legacy/util/Localization');

require('./LabeledSeparator');


module.exports = exports = Ext.define('NextThought.common.menus.AnswerHistory', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.answer-history-menu',
	cls: 'answer_history_menu',
	overflowHandler: 'Scroller',
	constrain: true,

	items: [
		{
			text: getString('NextThought.view.menus.AnswerHistory.answer'), cls: 'answer-title', allowUncheck: false, answerHistoryTitle: true},
		{
			text: getString('NextThought.view.menus.AnswerHistory.loading'), allowUncheck: false, noAnswerHistory: true
		}
	],

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		listeners: {
			'beforecheckchange': function (item, checked) { return item.allowUncheck !== false; },
			'click': function (item) {item.up('menu').handleClick(item);}
		}
	},

	initComponent: function () {
		this.callParent(arguments);
		this.store.on('changed', this.reload, this);
		this.store.on('load', this.reload, this);
	},

	reload: function () {
		var items = [], me = this;

		this.removeAll();
		items.push({text: getString('NextThought.view.menus.AnswerHistory.answer'), cls: 'answer-title', allowUncheck: false, answerHistoryTitle: true});

		this.store.each(function (r) {
			var parts = r.get('parts'),
				part = parts[me.renderedData.partNum],
				t = part.get('submittedResponse');
			items.push({
				xtype: me.renderedData.menuItemType || 'menuitem',
				text: t
			});
		});

		if (items.length === 1) {
			items.push({text: getString('NextThought.view.menus.AnswerHistory.noanswer'), cls: 'no-answer-history', allowUncheck: false, noAnswerHistory: true});
		}
		this.add(items);
		if (this.el) {
			this.doConstrain();
		}
		if (this.isVisible() && this.showByArgs) {
			this.showBy.apply(this, this.showByArgs);
		}
	},

	handleClick: function (item) {
		if (!item.is('[answerHistoryTitle]') && !item.is('[noAnswerHistory]')) {
			this.ownerCmp.up('assessment-question').reset();
			this.ownerCmp.setValue(item.text);
			this.ownerCmp.enableSubmission();
		}
	},

	showBy: function () {
		this.showByArgs = Array.prototype.slice.call(arguments);
		this.callParent(arguments);
	}
});

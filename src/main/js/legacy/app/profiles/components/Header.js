const Ext = require('extjs');

require('legacy/mixins/Router');


module.exports = exports = Ext.define('NextThought.app.profiles.components.Header', {
	extend: 'Ext.Component',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	buttonTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'tip', cn: [
			{cls: 'button {cls}', 'data-action': '{action}', 'data-qtip': '{tip}', html: '{label}'}
		]},
		{tag: 'tpl', 'if': '!tip', cn: [
			{cls: 'button {cls}', 'data-action': '{action}', html: '{label}'}
		]}
	])),


	tabTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'tab{[values.active ? " active" : ""]}', 'data-route': '{route}', 'data-title': '{label}', html: '{label}'
	})),


	renderTpl: Ext.DomHelper.markup(
		{cls: 'buttons'},
		{cls: 'tabs'}
	),


	renderSelectors: {
		buttonsEl: '.buttons',
		tabsEl: '.tabs'
	},


	afterRender: function () {
		this.callParent(arguments);

		if (!this.buttonsEl) {
			this.addButton = function () {};
			this.clearButtons = function () {};
		} else {
			this.mon(this.buttonsEl, 'click', this.onButtonClick.bind(this));
		}

		if (!this.tabsEl) {
			this.addTab = function () {};
			this.clearTabs = function () {};
		} else {
			this.mon(this.tabsEl, 'click', this.onTabClick.bind(this));
		}
	},


	onButtonClick: function (e) {
		if (e.getTarget('.disabled')) {
			return;
		}

		var button = e.getTarget('.button'),
			action = button && button.getAttribute('data-action');

		if (action && this[action]) {
			this[action](button, e);
		}
	},


	onTabClick: function (e) {
		var tab = e.getTarget('.tab'),
			route = tab && tab.getAttribute('data-route'),
			title = tab && tab.getAttribute('data-title');

		if (route) {
			this.pushRoute(title, route);
		}
	},


	addButton: function (data) {
		data.tip = data.tip || '';

		this.buttonTpl.append(this.buttonsEl, data);
	},


	addTab: function (data) {
		this.tabTpl.append(this.tabsEl, data);
	},


	clearButtons: function () {
		this.buttonsEl.dom.innerHTML = '';
	},


	clearTabs: function () {
		this.tabsEl.dom.innerHTML = '';
	}
});

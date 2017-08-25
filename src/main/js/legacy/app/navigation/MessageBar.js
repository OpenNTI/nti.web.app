const Ext = require('extjs');
const { getEmitter } = require('nti-web-commons');

module.exports = exports = Ext.define('NextThought.app.navigation.MessageBar', {
	extend: 'Ext.Component',
	alias: 'widget.navigation-message-bar',

	cls: 'main-message-bar',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'icon {iconCls}'},
		{cls: 'msg', html: '{msg}'},
		{cls: 'buttons'},
		{cls: 'close'}
	]),

	renderSelectors: {
		buttonsEl: '.buttons',
		closeEl: '.close',
		messageEl: '.msg',
		iconEl: '.icon'
	},


	buttonTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'tip', cn: [
			{cls: 'button {cls}', 'data-action': '{action}', 'data-qtip': '{tip}', html: '{label}'}
		]},
		{tag: 'tpl', 'if': '!tip', cn: [
			{cls: 'button {cls}', 'data-action': '{action}', html: '{label}'}
		]}
	])),


	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.applyIf(this.renderData || {}, {iconCls: '', msg: ''});
	},


	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.closeEl, 'click', this.close.bind(this));
		this.mon(this.buttonsEl, 'click', this.buttonClicked.bind(this));
	},


	addButton: function (data) {
		data.tip = data.tip || '';
		this.buttonTpl.append(this.buttonsEl, data);
		if (data.action) {
			this[data.action] = data.handler || function () {};
		}
	},


	setMessage: function (msg) {
		this.messageEl.update(msg);
	},


	setIcon: function (iconCls) {
		if (iconCls) {
			this.iconEl.addCls(iconCls);
			this.iconCls = iconCls;
		}
	},


	clear: function () {
		if (this.iconCls) {
			this.iconEl.removeCls(this.iconCls);
			delete this.iconCls;
		}
		this.messageEl.update('');
		this.buttonsEl.update('');
	},

	buttonClicked: function (e) {
		var button = Ext.get(e.target),
			action = button && button.getAttribute('data-action');

		if (action && this[action]) {
			this[action]();
		}
	},


	close: function () {
		var vel = Ext.query('.x-viewport')[0];

		if (this.closeHandler) {
			this.closeHandler();
		}

		if (vel) {
			Ext.fly(vel).removeCls('msg-bar-open');
			getEmitter().emit('msg-bar-closed');
		}

		this.clear();
	}
});

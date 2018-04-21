const Ext = require('@nti/extjs');

const {getString} = require('legacy/util/Localization');

module.exports = exports = Ext.define('NextThought.app.account.Header', {
	extend: 'Ext.Component',
	alias: 'widget.account-header-view',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'account-header-view',
			cn: [
				'{user:avatar}',
				{cls: 'text', cn: [
					{cls: 'title', html: '{title}'},
					{cls: 'detail', html: '{detail}'}
				]}
			]
		}
	]),

	renderSelectors: {
		img: '.account-header-view .avatar img',
		title: '.text .title',
		detail: '.text .detail'
	},

	updateRenderData: function () {
		// var iconURL;
		// if (this.icon === 'alert'){
		// 	iconURL = Ext.BLANK_IMAGE_URL;
		// }
		this.renderData = Ext.apply(this.renderData || {},{
			user: $AppConfig.userObject,
			title: this.title || getString('NextThought.view.account.Header.title'),
			detail: this.detail || getString('NextThought.view.account.Header.detail')
		});
	},

	initComponent: function () {
		this.callParent(arguments);

		this.updateRenderData();
	},

	updateHeaderText: function (t, d) {
		this.title.dom.innerHTML = t;
		this.detail.dom.innerHTML = d;
	},

	updateTitle: function (t) {
		this.title.dom.innerHTML = t;
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.noIcon) {
			this.el.down('.avatar').remove();
			this.el.down('.text').addCls('full-width');
			this.updateLayout();
		}

		// if (this.icon === 'alert') {
		// 	this.el.down('.avatar').addCls('alert');
		// 	this.el.down('.avatar img').remove();
		// }

	}
});

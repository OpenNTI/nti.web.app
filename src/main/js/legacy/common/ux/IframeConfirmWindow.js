var Ext = require('extjs');
var UxIframeWindow = require('./IframeWindow');


module.exports = exports = Ext.define('NextThought.common.ux.IframeConfirmWindow', {
	extend: 'NextThought.common.ux.IframeWindow',
	alias: 'widget.iframe-confirm-window',

	cls: 'confirm-window',

	noSaveLink: true,
	layout: 'none',

	items: [
		//{xtype: 'nti-window-header'},
		{
			xtype: 'box',
			itemId: 'iframe',
			cls: 'iframe confirm loading',
			autoEl: {
				tag: 'iframe',
				src: '{url}',
				frameBorder: 0,
				marginWidth: 0,
				marginHeight: 0,
				seamless: true,
				transparent: true,
				allowTransparency: true,
				style: 'overflow-x: hidden; overflow-y:auto; height: 550px;'
			}
		},
		{
			xtype: 'container',
			ui: 'footer',
			height: 55,
			layout: 'none',
			defaults: {
				cls: 'footer-region',
				xtype: 'container',
				flex: 1,
				layout: 'none'
			},
			items: [{
				layout: 'auto',
				footerContainer: true,
				cls: 'nti-window-footer',
				defaults: { xtype: 'button', ui: 'blue', scale: 'large'},
				items: [
					{ xtype: 'box', cls: 'iframe-save', save: true, autoEl: { tag: 'a', href: '{url}', html: 'Save', target: '_blank'}},
					{
						text: 'Confirm',
						confirm: true,
						ui: 'blue',
						cls: 'x-btn-blue-large confirm',
						action: 'confirm',
						style: { 'float': 'right'},
						handler: function (b, e) {
							e.stopEvent();
							b.up('window').onConfirm();
						}
					},
					{
						text: 'Deny',
						deny: true,
						ui: 'red',
						cls: 'x-btn-blue-large',
						action: 'deny',
						style: { 'float': 'left'},
						handler: function (b, e) {
							e.stopEvent();
							b.up('window').onDeny();
						}
					}
				]
			}]
		}
	],


	initComponent: function () {
		this.callParent(arguments);

		var confirm = this.down('button[confirm]'),
			deny = this.down('button[deny]');

		if (confirm && this.confirmText) {
			confirm.setText(this.confirmText);
		}

		if (deny && this.denyText) {
			deny.setText(this.denyText);
		}
	},


	onConfirm: function () {
		if (this.confirmAction) {
			this.el.mask('Loading...');
			this.confirmAction()
				.then(this.close.bind(this))
				.catch(this.handleFailure.bind(this));
		} else {
			this.close();
		}
	},


	onDeny: function () {
		if (this.denyAction) {
			this.el.mask('Loading...');
			this.denyAction()
				.then(this.close.bind(this))
				.catch(this.handleFailure.bind(this));
		} else {
			this.close();
		}
	},


	handleFailure: function () {
		var footer = this.down('[footerContainer]');

		footer.removeAll();

		footer.add({
			text: 'Close',
			confirm: true,
			ui: 'blue',
			cls: 'x-btn-blue-large confirm',
			action: 'confirm',
			style: { 'float': 'right'},
			handler: function (b, e) {
				e.stopEvent();
				b.up('window').close();
			}
		});

		this.removeAll();

		this.add({
			xtype: 'box',
			cls: 'error-text',
			autoEl: {html: 'There was an error saving your response. You will be prompted to try again next time you login.'}
		});

		this.el.unmask();
	}
});

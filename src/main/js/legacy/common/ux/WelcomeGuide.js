const Ext = require('extjs');

const {getURL} = require('legacy/util/Globals');

require('../window/Window');


module.exports = exports = Ext.define('NextThought.common.ux.WelcomeGuide', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.welcome-guide',

	cls: 'guide-window',
	width: 695,
	height: 640,
	layout: 'none',
	modal: true,
	header: false,
	items: [
		{
			xtype: 'component',
			cls: 'help-iframe',
			height: 585,
			autoEl: {
				tag: 'iframe',
				src: '{url}',
				frameBorder: 0,
				marginWidth: 0,
				marginHeight: 0,
				seamless: true,
				transparent: true,
				allowTransparency: true,
				style: 'overflow-x: hidden; overflow-y: auto; height: 580px;'
			}
		},
		{
			xtype: 'container',
			ui: 'footer',
			cls: 'nti-window-footer',
			height: 55,
			width: 694,
			layout: 'none',
			defaults: {
				cls: 'footer-region',
				xtype: 'container',
				flex: 1,
				layout: 'none'
			},
			items: [{
				defaults: { xtype: 'button', ui: 'blue', scale: 'large'},
				items: [
					//{text: 'Learn More',	action: 'more', ui: 'secondary', handler: function(b, e){ e.stopEvent();b.up('window').learnMore(); } },
					{text: 'Get Started!', cls: '.x-btn-blue-large dismiss', action: 'cancel', handler: function (b, e) { e.stopEvent(); b.up('window').close();}}
				]
			}]
		}
	],

	initComponent: function () {
		this.callParent(arguments);
		this.down('component[cls=help-iframe]').autoEl.src = getURL((this.link && this.link.href) || this.link);
		this.on('show', this.addCustomMask, this);
		this.on('close', this.removeCustomMask, this);
		if (this.deleteOnDestroy) {
			this.on('destroy', this.deleteLink, this);
		}

		if (Ext.is.iOS) {
			this.on('afterrender', function () {
				var iframe = this.el.down('iframe');
				iframe.parent().el.setStyle('-webkit-overflow-scrolling', 'touch');
				iframe.parent().el.setStyle('overflow', 'auto');
			},this);
		}
	},

	addCustomMask: function () {
		var mask = this.zIndexManager.mask;
		mask.addCls('nti-black-clear');
	},


	removeCustomMask: function () {
		var mask = this.zIndexManager.mask;
		if (mask) {
			mask.removeCls('nti-black-clear');
		}
	},


	learnMore: function () {
		console.log('Learn more was clicked');
		this.fireEvent('go-to-help');
		this.close();
	},

	deleteLink: function () {
		Ext.Ajax.request({
			url: this.link.href || this.link,
			method: 'DELETE',
			success: function (r, opts) {
				console.log('Success: ', arguments);
			},
			fail: function (r, opts) {
				console.log('Fail: ', arguments);
			}
		});
	}
});

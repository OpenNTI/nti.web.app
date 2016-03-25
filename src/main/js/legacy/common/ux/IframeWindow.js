var Ext = require('extjs');
var WindowWindow = require('../window/Window');
var {getURL} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.common.ux.IframeWindow', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.iframe-window',

	cls: 'iframe-window',
	width: 695,
	height: 640,
	layout: 'none',
	modal: true,
	header: false,

	desiredWidth: 842,
	desiredHeight: 595,

	config: {
		loadingText: 'Loading...'
	},

	items: [
		{
			xtype: 'box',
			itemId: 'iframe',
			cls: 'iframe loading',
			autoEl: {
				tag: 'iframe',
				src: '{url}',
				frameBorder: 0,
				marginWidth: 0,
				marginHeight: 0,
				seamless: true,
				transparent: true,
				allowTransparency: true,
				style: 'overflow-x: hidden; overflow-y:auto; height: 585px;'
			}
		},
		{
			xtype: 'container',
			height: 55,
			layout: 'none',
			defaults: {
				cls: 'footer-region',
				xtype: 'container',
				flex: 1,
				layout: 'none'
			},
			items: [{
				layout: 'none',
				defaults: { xtype: 'button', ui: 'blue', scale: 'large'},
				items: [
					//{text: 'Save', cls: 'x-btn-flat-large save', action: 'save', href: '{url}', style: { float: 'left'}},
					{ xtype: 'box', cls: 'iframe-save', save: true, autoEl: { tag: 'a', href: '{url}', html: '', target: '_blank'}},
					{
						text: 'Close',
						cls: 'x-btn-blue-large dismiss',
						action: 'cancel',
						style: { 'float': 'right'},
						handler: function (b, e) {
							e.stopEvent(); b.up('window').close();
						}
					}
				]
			}]
		}
	],

	initComponent: function () {
		this.callParent(arguments);

		var me = this,
			url = getURL((this.link && this.link.href) || this.link),
			save = this.down('box[save]'),
			iframe = this.down('box[itemId=iframe]'),
			extraParams = '#view=FitH&toolbar=0&navpanes=0&statusbar=0&page=1';

		iframe.autoEl.src = url.substr(-3, 3) === 'pdf' ? url + extraParams : url;

		if (this.noSaveLink) {
			save.destroy();
		} else {
			save.autoEl.href = this.saveUrl || url;
			save.autoEl.html = this.saveText || 'Save';
		}

		iframe.on({
			afterRender: function (cmp) {
				var parent = cmp.el.parent(),
					iframe = cmp.el.dom,
					loaded = false,
					masked = false,
					p = wait(100).then(function () {
						if (!loaded) {
							masked = true;
							parent.mask(me.getLoadingText(), 'navigation');
						}
					});

				if (me.iframeHeight) {
					iframe.style.height = me.iframeHeight + 'px';
				}

				cmp.el.on('load', function () {
					loaded = true;
					if (masked) {
						p.then(parent.unmask.bind(parent));
					}
				});
			}
		});

		this.on('show', this.addCustomMask, this);
		this.on('close', this.removeCustomMask, this);

		if (Ext.is.iOS) {
			this.on('afterrender', function () {
				var iframe = this.el.down('iframe');
				iframe.parent().el.setStyle('-webkit-overflow-scrolling', 'touch');
				iframe.parent().el.setStyle('overflow', 'auto');
			},this);
		}

		if (this.width === 'max') {
			this.fillScreen();
		}
	},


	fillScreen: function () {
		var aspect = this.desiredWidth / this.desiredHeight, //width / height
			height, width,
			iframe = this.down('box[itemId=iframe]'),
			MAX_WIDTH = (Ext.Element.getViewWidth() - 50), //window width - padding
			MAX_HEIGHT = (Ext.Element.getViewHeight() - 20 - 55); //window height - padding - bottom bar

		height = MAX_HEIGHT;
		width = aspect * MAX_HEIGHT;

		while (width >= MAX_WIDTH) {
			height--;
			width = aspect * height;
		}

		this.iframeHeight = height;
		this.iframeWidth = width;

		this.setHeight(height + 55);
		this.setWidth(width);
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
	}
});

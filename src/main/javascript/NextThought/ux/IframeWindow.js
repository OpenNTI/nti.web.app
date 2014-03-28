Ext.define('NextThought.ux.IframeWindow', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.iframe-window',

	cls: 'iframe-window',
	width: 695,
	height: 640,
	layout: 'fit',
	modal: true,
	header: false,
	items: [{
		xtype: 'component',
		cls: 'iframe',
		autoEl: {
			tag: 'iframe',
			src: '{url}',
			frameBorder: 0,
			marginWidth: 0,
			marginHeight: 0,
			seamless: true,
			transparent: true,
			allowTransparency: true,
			style: 'overflow-x: hidden; overflow-y:auto'
		}
	}],
	dockedItems: {
		xtype: 'container',
		dock: 'bottom',
		ui: 'footer',
		height: 55,
		baseCls: 'nti-window',
		layout: {
			type: 'hbox',
			align: 'stretchmax'
		},
		defaults: {
			cls: 'footer-region',
			xtype: 'container',
			flex: 1,
			layout: 'hbox'
		},
		items: [{
			layout: 'auto',
			defaults: { xtype: 'button', ui: 'blue', scale: 'large'},
			items: [
				//{text: 'Save', cls: 'x-btn-flat-large save', action: 'save', href: '{url}', style: { float: 'left'}},
				{ xtype: 'component', cls: 'iframe-save', save: true, autoEl: { tag: 'a', href: '{url}', html: 'Save', target: '_blank'}},
				{
					text: 'Close',
					cls: 'x-btn-blue-large dismiss',
					action: 'cancel',
					style: { 'float': 'right'},
					handler: function(b, e) {
						e.stopEvent(); b.up('window').close();
					}
				}
			]
		}]
	},

	initComponent: function() {
		this.callParent(arguments);

		var url = getURL((this.link && this.link.href) || this.link),
			save = this.down('component[save]'),
			extraParams = '#view=FitH&toolbar=0&navpanes=0&statusbar=0&page=2';

		this.down('component[cls=iframe]').autoEl.src = url.substr(-3, 3) === 'pdf' ? url + extraParams : url;
		save.autoEl.href = url;
		save.autoEl.html = this.saveText || 'Save';

		this.on('show', this.addCustomMask, this);
		this.on('close', this.removeCustomMask, this);

		if (Ext.is.iOS) {
			this.on('afterrender', function() {
				var iframe = this.el.down('iframe');
				iframe.parent().el.setStyle('-webkit-overflow-scrolling', 'touch');
				iframe.parent().el.setStyle('overflow', 'auto');
			},this);
		}

		if (this.width === 'max') {
			this.fillScreen();
		}
	},


	fillScreen: function() {
		var maxWidth = Ext.Element.getViewWidth() - 50, //window width - padding
			maxHeight = Ext.Element.getViewHeight() - 20 - 55, //window height - padding - bottom bar
			aspect = 842 / 595, //width / height
			height, width;

		height = maxHeight;
		width = aspect * height;

		while (width >= maxWidth) {
			height = height - 1;
			width = aspect * height;
		}

		this.setHeight(height + 55);
		this.setWidth(width);
	},


	addCustomMask: function() {
		var mask = this.zIndexManager.mask;
		mask.addCls('nti-black-clear');
	},


	removeCustomMask: function() {
		var mask = this.zIndexManager.mask;
		if (mask) {
			mask.removeCls('nti-black-clear');
		}
	}
});

var Ext = require('extjs');
var WindowWindow = require('../../common/window/Window');
var WhiteboardEditor = require('./Editor');


module.exports = exports = Ext.define('NextThought.app.whiteboard.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.wb-window',
	hideMode: 'display',
	title: 'Whiteboard',
	cls: 'wb-window',
	ui: 'wb-window',
	minWidth: 750,
	maxWidth: 750,
	minHeight: 400,
	TARGET_HEIGHT: 662,
	resizable: true,
	maximizable: false,
	draggable: true,
	modal: true,
	layout: 'none',

	items: [
		{ xtype: 'whiteboard-editor' },
		{
			xtype: 'container',
			dock: 'bottom',
			ui: 'footer',
			layout: 'none',
			cls: 'nti-window-footer',
			defaults: {
				cls: 'footer-region',
				xtype: 'container',
				layout: 'none'
			},
			items: [
				{
					defaults: { xtype: 'button', scale: 'medium', enabled: true },
					items: [
						{iconCls: 'new-page', ui: 'new', action: 'new-page', tooltip: 'Clear Page', handler: function(b) {
							b.up('window').clearAll();
						} }
					]
				},
				{
					flex: 2,
					layout: 'none',
					defaults: { xtype: 'button', scale: 'medium', disabled: true },
					items: [
						{iconCls: 'undo', ui: 'history', action: 'undo', tooltip: 'Undo', hidden: true },
						{iconCls: 'redo', ui: 'history', action: 'redo', tooltip: 'Redo', hidden: true }
					]
				},
				{
					layout: 'none',
					cls: 'right',
					defaults: {xtype: 'button', ui: 'primary', scale: 'large'},
					items: [
						{text: 'Cancel', action: 'cancel', ui: 'secondary', handler: function(b, e) {
							e.stopEvent();
							b.up('window').close();
						} },
						{text: 'Save', action: 'save', handler: function(b, e) {
							e.stopEvent();
							b.up('window').save(b);
						} }
					]
				}
			]
		}
	],

	isWhiteboardWindow: true,

	constructor: function(config) {
		var vpHeight = Ext.Element.getViewportHeight();

		//ensure the max height is not bigger than the viewport
		this.maxHeight = vpHeight;

		//ensure we're dealing with a local instance copy instead of prototype instance
		this.items = Ext.clone(this.items);

		// We want the height to be auto. So ext component will tell us how tall we should be.
		delete config.height;

		//see parent class as to why there is an extra level of items...
		Ext.copyTo(this.items[1].items[0], config, 'value');

		this.callParent(arguments);

		//in readonly mode, remove buttons that do stuff, except for cancel, call it close:
		if (config.readonly) {
			this.down('button[action=save]').destroy();
			this.down('[action=undo]').destroy();
			this.down('[action=redo]').destroy();
			this.down('[action=new-page]').destroy();
			this.down('button[action=cancel]').setText('Close');
		}

		this.mon(new Ext.dom.CompositeElement(Ext.query('body > .x-mask')), {
			scope: this,
			'click': this.absorbeClick
		});

		if(Ext.is.iOS){
		   this.minHeight = 671;
		}
	},

	absorbeClick: function(e) {
		if (this.isVisible()) {
			e.stopEvent();
			return false;
		}
		return true;
	},

	save: function(btn) {
		var win = btn.up('window').hide(),
			wb = win.down('whiteboard-editor');

		wb.initialConfig.value = wb.getValue();
		//wb.fireEvent('save', wb);
		win.fireEvent('save', win, wb);
		win.close();
	},

	close: function() {
		this.close = function() {
		};
		this.cancel();
		return this.callParent(arguments);
	},

	cancel: function() {
		this.hide();
		var e = this.down('whiteboard-editor');
		if (e) {
			e.reset();
		}

		if (this.cancelOnce !== false) {
			this.cancel = function() {
			};
		}

		this.fireEvent('cancel', this);
	},

	getEditor: function() {
		return this.down('whiteboard-editor');
	},

	getValue: function() {
		return this.down('whiteboard-editor').getValue();
	},

	afterRender: function() {
		this.callParent(arguments);
		var me = this;

		me.mon(me.el, 'click', me.absorbeClick, this);
		me.mon(this.el, 'click', function() {
			console.log('WB clicked');
			if (me.ownerCmp) {
				me.ownerCmp.fireEvent('status-change', {status: 'composing'});
			}
		});

		this.onWindowResize();
		Ext.EventManager.onWindowResize(this.onWindowResize, this);
	},

	onWindowResize: function() {
		var viewportHeight = Ext.Element.getViewportHeight(),
			targetH = this.readonly ? this.TARGET_HEIGHT - 142 : this.TARGET_HEIGHT;

		if (!this.el) {
			return;
		}

		if (viewportHeight < targetH) {
			this.el.addCls('wb-small');
		}
		else {
			this.el.removeCls('wb-small');
		}
	},

	clearAll: function() {
		var me = this;
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: 'All your current progress\nwill be lost.',
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: Ext.Msg.WARNING,
			fn: function(str) {
				if (str === 'ok') {
					me.down('whiteboard-editor').clear();
				}
			}
		});
	}
});

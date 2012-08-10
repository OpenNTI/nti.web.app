Ext.define('NextThought.view.whiteboard.Window',{
	extend: 'NextThought.view.Window',
	alias: 'widget.wb-window',
	requires: [
		'NextThought.view.whiteboard.Editor'
	],

	hideMode: 'display',

	title: 'Whiteboard',

	cls: 'wb-window',
	ui: 'wb-window',
	minWidth: 750,

	modal: true,
	layout: 'fit',
	items: [{ xtype: 'whiteboard-editor' }],

	dockedItems: [
		{
			xtype: 'container',
			dock: 'bottom',
			ui: 'footer',
			baseCls: 'nti-window',
			layout: {
				type: 'hbox',
				align: 'stretchmax'
			},
			defaults:{
				cls: 'footer-region',
				xtype: 'container',
				flex: 1,
				layout: 'hbox'
			},
			items: [
				{
					defaults: { xtype: 'button', scale: 'medium', disabled: true },
					items: [
						{iconCls: 'new-page', ui: 'new', action: 'new-page', tooltip: 'New Page' }
					]
				},
				{
					flex: 2,
					layout: { type: 'hbox', pack: 'center' },
					defaults: { xtype: 'button', scale: 'medium', disabled: false },
					items: [
						{iconCls: 'undo', ui: 'history', action: 'undo', tooltip: 'Undo', 
							handler: function(b){b.up('window').undo(b)} },
						{iconCls: 'redo', ui: 'history', action: 'redo', tooltip: 'Redo',
							handler: function(b){b.up('window').redo(b)} }
					]
				},
				{
					layout: { type: 'hbox', pack: 'end' },
					defaults: {xtype: 'button', ui: 'primary', scale: 'medium'},
					items: [
						{text: 'Cancel', ui: 'secondary', handler: function(b){b.up('window').cancel(b);} },
						{text: 'Save', action: 'save', handler: function(b){b.up('window').save(b);} }
					]
				}
			]
		}
	],

	undo: function(btn) {
		var win = btn.up('window'),
			wc = win.down('whiteboard-canvas');
		wc.undo();
	},

	redo: function(btn) {
		var win = btn.up('window'),
			wc = win.down('whiteboard-canvas');
		wc.redo();
	},

	constructor: function(config){
		//ensure we're dealing with a local instance copy instead of prototype instance
		this.items = Ext.clone(this.items);

		//see parent class as to why there is an extra level of items...
		Ext.copyTo(this.items[1].items[0],config,'value');

		return this.callParent(arguments);
	},




	save: function (btn) {
		var win = btn.up('window').hide(),
			wb = win.down('whiteboard-editor');

		wb.initialConfig.value = wb.getValue();
		//wb.fireEvent('save', wb);
		win.fireEvent('save', win, wb);
	},


	cancel: function (btn) {
		var win = btn.up('window');
		win.hide().down('whiteboard-editor').reset();
		win.fireEvent('cancel', win);
	},


	getEditor: function(){
		return this.down('whiteboard-editor');
	},


	getValue: function(){
		return this.down('whiteboard-editor').getValue();
	}
});

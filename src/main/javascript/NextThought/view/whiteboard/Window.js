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

	resizable: false,
	maximizable: false,
	draggable: true,

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
					defaults: { xtype: 'button', scale: 'medium', enabled: true },
					items: [
						{iconCls: 'new-page', ui: 'new', action: 'new-page', tooltip: 'Clear Page', handler: function(b){b.up('window').clearAll();} }
					]
				},
				{
					flex: 2,
					layout: { type: 'hbox', pack: 'center' },
					defaults: { xtype: 'button', scale: 'medium', disabled: true },
					items: [
						{iconCls: 'undo', ui: 'history', action: 'undo', tooltip: 'Undo', hidden: true },
						{iconCls: 'redo', ui: 'history', action: 'redo', tooltip: 'Redo',hidden: true }
					]
				},
				{
					layout: { type: 'hbox', pack: 'end' },
					defaults: {xtype: 'button', ui: 'primary', scale: 'large'},
					items: [
						{text: 'Cancel', action: 'cancel', ui: 'secondary', handler: function(b,e){e.stopEvent();b.up('window').cancel();} },
						{text: 'Save', action: 'save', handler: function(b,e){e.stopEvent();b.up('window').save(b);} }
					]
				}
			]
		}
	],

	constructor: function(config){
		//ensure we're dealing with a local instance copy instead of prototype instance
		this.items = Ext.clone(this.items);

		// We want the height to be auto. So ext component will tell us how tall we should be.
		delete config.height;

		//see parent class as to why there is an extra level of items...
		Ext.copyTo(this.items[1].items[0],config,'value');

		var r = this.callParent(arguments);

		//in readonly mode, remove buttons that do stuff, except for cancel, call it close:
		if(config.readonly){
			this.down('button[action=save]').destroy();
			this.down('[action=undo]').destroy();
			this.down('[action=redo]').destroy();
			this.down('[action=new-page]').destroy();
			this.down('button[action=cancel]').setText('Close');
		}

		this.mon(new Ext.dom.CompositeElement(Ext.query('body > .x-mask')),{
			scope: this,
			'click': this.absorbeClick
		});

		return r;
	},



	absorbeClick: function(e){
		if(this.isVisible()){
			e.stopEvent();
			return false;
		}
		return true;
	},


	save: function (btn) {
		var win = btn.up('window').hide(),
			wb = win.down('whiteboard-editor');

		wb.initialConfig.value = wb.getValue();
		//wb.fireEvent('save', wb);
		win.fireEvent('save', win, wb);
	},

	close: function(){
		this.close = function(){};
		this.cancel();
		return this.callParent(arguments);
	},

	cancel: function () {
		this.hide();
		var e = this.down('whiteboard-editor');
		if( e ){
			e.reset();
		}
		this.fireEvent('cancel', this);
	},


	getEditor: function(){
		return this.down('whiteboard-editor');
	},


	getValue: function(){
		return this.down('whiteboard-editor').getValue();
	},


    afterRender: function(){
        this.callParent(arguments);
        this.mon(this.el, 'click', this.absorbeClick, this);
    },

	clearAll: function(){
		var me = this;
		Ext.Msg.show({
				msg: 'All your current progress\nwill be lost',
				buttons: 9, // bitwise result of: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				scope: me,
				fn: function(str){
					if(str === 'ok'){
						me.down('whiteboard-editor').clear();
					}
				}
			});
	}

});

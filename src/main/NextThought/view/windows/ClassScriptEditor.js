Ext.define('NextThought.view.windows.ClassScriptEditor', {
	extend: 'Ext.window.Window',
	alias : 'widget.class-script-editor',
	requires: [
		'NextThought.view.widgets.classroom.ResourceView'
	],

	constrain: true,
	closable: false,
	maximizable:true,
	border: false,
	modal: true,
	layout: 'border',
	title: 'Script Editor',

	defaults: {
		border: false, frame: false,
		defaults: {
			border: false, frame: false
		}
	},
	bbar: [
		'->',
		{ xtype: 'button', text: 'Save',	action: 'save' },
		{ xtype: 'button', text: 'Cancel',	action: 'cancel', handler: function(btn){btn.up('window').close();}}
	],
	items: [
//		{
//			region: 'north',
//			layout: {
//				type: 'hbox',
//				pack: 'start'
//			},
//			items: [
//				{html: 'class title goes here', classInfoName: true, flex: 1}
//			]
//		},
		{
			region: 'center',
			xtype: 'classroom-resource-view'
		},
		{
			region: 'east',
			html: 'whatever editor makes sense',
			collapsed: true
		}
	],


	initComponent: function() {
		if (!this.classInfo) {
			Ext.Error.raise('Must create script editor with a class info object');
		}

		this.setSize(Ext.getBody().getWidth()*0.7, Ext.getBody().getHeight()*0.7);

		this.callParent(arguments);

		//tell the resource view about it's classinfo
		this.down('classroom-resource-view').setRecord(this.classInfo);
	},

	addTools: function(){
		//populate the combo box
		var ci = this.classInfo,
			sel,
			store = Ext.create('Ext.data.Store', {fields: ['ID', 'record']});

		sel = store.add({'ID': ci.get('ID'), 'record': ci});

		Ext.each(ci.get('Sections'), function(s){
			store.add({'ID': ' -> ' + s.get('ID'), 'record': s});
		});

		this.addTool({
			xtype:'combobox',
			fieldLabel: 'Target',
			labelWidth: 40,
			displayField: 'ID',
			valueField: 'record',
			width: 200,
			editable: false,
			forceSelection: true,
			store: store,
			value: sel,
			queryMode: 'local'
		});


		this.callParent();
	}

});

Ext.define('NextThought.view.windows.ClassResourceEditor', {
	extend: 'Ext.window.Window',
	alias : 'widget.class-resource-editor',
	requires: [
		'NextThought.view.widgets.classroom.ResourceView',
		'NextThought.view.widgets.menu.FileBrowserItem'
	],

	constrain: true,
	closable: true,
	maximizable:true,
	border: false,
	modal: true,
	layout: 'border',
	title: 'Resources',
	cls: 'class-resource-editor',

	defaults: {
		border: false, frame: false,
		defaults: {
			border: false, frame: false
		}
	},
	items: [
		{
			region: 'center',
			xtype: 'classroom-resource-view'
		},
		{
			region: 'east',
			layout: 'fit',
			minWidth: 500,
			collapsed: true,
			split: true,
			listeners: {
				'collapse': function(p){p.removeAll(true);}
			}
		}
	],

	ghostTools: function(){
		return {type: 'placeholder'};
	},


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
			store = Ext.create('Ext.data.Store', {fields: ['ID', 'record']}),
			tool, button;

		sel = store.add({'ID': ci.get('ID'), 'record': ci});

		Ext.each(ci.get('Sections'), function(s){
			store.add({'ID': ' -> ' + s.get('ID'), 'record': s});
		});

		tool = {
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
		};

		button = {
			xtype:'button',
			text:'Add',
			menu:[
				{ text: 'Script...', addscript: true },
				{ xtype: 'file-browser-menu-item', target: this.down('classroom-resource-view') }
			]
		};

		this.addTool(tool);
		this.addTool(button);
		this.callParent();
	}
});

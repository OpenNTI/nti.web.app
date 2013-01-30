Ext.define('NextThought.view.classroom.ClassResourceEditor', {
	extend: 'Ext.window.Window',
	alias : 'widget.class-resource-editor',
	requires: [
		'NextThought.view.classroom.ResourceView',
		'NextThought.view.menus.file.BrowserItem',
		'Ext.data.Store'
	],

	constrain: true,
	closable: true,
	maximizable:true,
	border: false,
	modal: true,
	layout: {
		type:'hbox',
		align: 'stretch'
	},
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
			flex: 1,
			maintainFlex: true,
			xtype: 'classroom-resource-view'
		},
		{
			xtype: 'splitter',
			hidden: true
		},
		{
			header: false,
			hideCollapseTool: true,
			region: 'east',
			layout: 'fit',
			minWidth: 500,
			width: 500,//needed to properly init size values...render correctly.
			hidden: true,//needed so it doesn't render a blank space
			collapsed: true,
			split: true,
			listeners: {
				'collapse': function(p){
					p.previousSibling('splitter').hide();
					p.removeAll(true);
				},
				'expand': function(p){
					p.previousSibling('splitter').show();
					p.show();//initially hidden...
				}
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

		this.callParent(arguments);

		this.setSize(Ext.getBody().getWidth()*0.7, Ext.getBody().getHeight()*0.7);

		//tell the resource view about it's classinfo
		this.down('classroom-resource-view').setRecord(this.classInfo);
	},

	addTools: function(){
		//populate the combo box
		var ci = this.classInfo,
			me = this,
			sel,
			store = Ext.data.Store.create({fields: ['ID', 'record']}),
			tool, button,
			baseCfg = {
				xtype: 'button',
				allowDepress: false,
				enableToggle: true,
				tooltip: 'Switch View Mode',
				toggleGroup: Globals.guidGenerator()+'resourceView',
				handler: function(btn){
					var view = btn.iconCls,
						o = me.down('classroom-resource-view');

					o['setViewTo'+view].call(o);
				}
			};

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
		this.addTool(Ext.apply({ iconCls: 'Details', pressed: true}, baseCfg));
		this.addTool(Ext.apply({ iconCls: 'Grid'}, baseCfg));
		this.callParent();
	}
});

Ext.define('NextThought.view.whiteboard.editor.StrokeWidthSelector',{
	extend: 'NextThought.view.form.fields.ComboBox',
	alias: 'widget.stroke-select',

	ui: 'stroke-size-select',
	width: 85,

	store: Ext.create('Ext.data.Store', {
		fields: ['size','size-class'],
		data : [
			{'size': 1, 'size-class': 'fine'},
			{'size': 2, 'size-class': 'thin'},
			{'size': 3, 'size-class': 'medium'},
			{'size': 4, 'size-class': 'heavy'},
			{'size': 5, 'size-class': 'thick'}
		]
	}),

	queryMode: 'local',
	displayField: 'size-class',
	valueField: 'size',
	forceSelection: true,
	value: 1,

	listConfig: {
		ui: 'nt',
		plain: true,
		shadow: false,
		frame: false,
		border: false,
		cls: 'x-menu stroke-size-list',
		baseCls: 'x-menu',
		itemCls: 'x-menu-item stroke-size no-border',
		getInnerTpl: function() {
			return '<div class="stroke {size-class}"></div>';
		},
		xhooks: {
			initComponent: function(){
				this.callParent(arguments);
				this.itemSelector = '.stroke-size';
			}
		}
	},

	initComponent: function(){
		this.callParent(arguments);

		this.on('select',function(me,val){
			me.inputEl.dom.setAttribute('value',val[0].get(me.displayField));
		},this);
	}
});

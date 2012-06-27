Ext.define('NextThought.view.whiteboard.editor.ToolOption',{
	alias: 'widget.wb-tool-option',
	extend: 'Ext.button.Split',

	scale: 'large',
	enableToggle: true,
	allowDepress: false,
	toggleGroup: 'whitebard-tool-option',

	ui: 'button',
	baseCls: 'whiteboard-tool-option',
	menuAlign: 't-b?',

	initComponent: function(){
		if(!this.options){
			this.split = false;
			delete this.arrowCls;
		}
		else {
			this.menu = this.buildOptions();
			this.value = this.value || this.menu.items[0].value;
			this.text = this.menu.items[0].text;//TODO: get the label from the valid value or the default. (build a function to get the label)
		}

		this.addCls(this.option);
		this.iconCls = this.option;
		this.tooltip = Ext.String.capitalize(this.option);
		this.callParent(arguments);
	},


	onClick : function(e, t) {
		var me = this;
		if (!me.disabled && me.pressed) {
			me.overMenuTrigger = true;
		}
		return this.callParent(arguments);
	},


	buildOptions: function(){
		var me = this,
			menu = {
			items:[],
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			minWidth: 70,
			xhooks: {
				showBy: function(cmp, pos, off){
					off = [0, 5];
					return this.callParent([cmp,pos,off]);
				}
			}
		};

		function builder (o){
			var i = o;
			if(!Ext.isObject(o)){
				i = { text: o, value: o, handler: function(m){me.setText(me.value = m.value);} };
			}
			i.plain = true;
			menu.items.push(i);
		}

		Ext.each(this.options,builder);
		return menu;
	},

	getValue: function(){
		return this.value;
	}

});


Ext.define('NextThought.view.widgets.main.ModeSwitcher', {
	extend: 'Ext.panel.Panel',
	alias : 'widget.modeswitcher',

	cls: 'mode-switcher',
	frame: false,
	border: false,
	layout: {
		type: 'hbox',
		pack: 'start',
		align: 'middle'
	},

	initComponent: function(){
		this.self.instance = this;
		return this.callParent(arguments);
	},

	afterRender: function(){
		this.callParent(arguments);
		if(this.items.length){
			this.setWidth(this.items.get(0).getWidth()*this.items.length);
		}
	},

	statics: {
		add: function(label, cls, ref){
			var i = this.instance;
			return i.add({
				xtype: 'button',
				cls: 'mode-button ',
				iconCls: cls,
				title: label,
				pressed:i.items.length===0,
				allowDepress: false,
				enableToggle: true,
				tooltip: label,
				toggleGroup: 'modeSwitcher',
				modeReference: ref
			});
		},

		set: function(ref){
			ref.toggle(true);
		}
	}

},function(){
	window.ModeSwitcher = this;
});

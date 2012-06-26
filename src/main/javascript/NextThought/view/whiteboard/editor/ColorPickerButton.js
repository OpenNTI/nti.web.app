Ext.define('NextThought.view.whiteboard.editor.ColorPickerButton',{
	extend: 'Ext.button.Button',
	alias: 'widget.color-picker-button',
	requires: [
		'NextThought.view.whiteboard.editor.ColorPicker'
	],


	scale: 'large',
	cls: 'color',
	ui: 'button',
	baseCls: 'whiteboard-color',
	menuAlign: 't-b?',
	menu: {xtype: 'color-picker'},


	initComponent: function(){
		this.callParent(arguments);
		this.value = this.value || 'NONE';

		this.palette = this.menu.down('color-palette');
		this.mon( this.menu,{
			scope: this,
			select: this.selectHandler
		})
	},


	selectHandler: function(palette,value){
		this.setValue(value);
	},


	getValue: function(){
		return this.value || 'NONE';
	},


	setValue: function(color){
		var me = this, found = false;
		Ext.each(this.palette.colors,function(c){
			if(c.value === color){ found=true; me.addCls(c.name); }
			else { me.removeCls(c.name); }
		});

		if(found){
			me.value = color;
		}
		else {
			Ext.Error.raise(Ext.String.format('The color "{0}" is invalid',color));
		}

		return this;
	}
});

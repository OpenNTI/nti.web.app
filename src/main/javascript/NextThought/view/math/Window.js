Ext.define('NextThought.view.math.Window', {
	extend: 'NextThought.view.Window',
	requires: [
		'NextThought.view.math.symbols.Panel'
	],
	alias: 'widget.math-symbol-window',
	dialog: true,
	cls: 'math-symbols',
	closeAction: 'destroy',
	hideMode: 'display',
	hidden: true,
	layout: 'auto',
	constrain: false,
	focusOnToFront: false,
	posFn: Ext.emptyFn,
	items: [
		{xtype: 'math-symbol-panel'}
	],

	initComponent: function(){
		if(!this.target){
			Ext.Error.raise('I have no idea whom I am talking to, specify a target');
		}

		this.callParent(arguments);
		this.down('math-symbol-panel').setTargetComponent(this.target);
	},


	destroy: function(){
		var c = this.down('math-symbol-panel');
		if (c){c.releaseTargetComponent();}
		return this.callParent(arguments);
	},

	show: function(){
		var rect = this.posFn();
		if(rect){
			this.setPosition(rect.left, rect.bottom, false);
		}
		else {
			this.center();
		}
		return this.callParent(arguments);
	}
});

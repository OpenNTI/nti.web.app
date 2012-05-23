Ext.define('NextThought.overrides.panel.Panel',{
	override: 'Ext.panel.Panel',

	render: function(){
		this.callParent(arguments);
		if(!this.enableSelect){this.el.unselectable();}
		else{this.el.selectable();}
	}

},function(){
	Ext.getBody().unselectable();
});

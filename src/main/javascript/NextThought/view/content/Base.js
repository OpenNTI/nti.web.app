Ext.define('NextThought.view.content.Base', {
	extend: 'Ext.panel.Panel',
	
	overflowX: 'hidden',
	overflowY: 'auto',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},


	getInsertionPoint: function(subElPostfix){
		if (subElPostfix){
			return Ext.get(this.getEl().id+'-'+subElPostfix);
		}

		return this.getTargetEl();
//		return Ext.get(this.getEl().id+'-innerCt');
//		return Ext.get(this.getEl().id+'-targetEl');
	},


	relayout: function(){
		if (this.ownerCt) {
			this.ownerCt.doComponentLayout();
		}
		this.doComponentLayout();
		this.doLayout();
		this.fireEvent('resize');
	}
});

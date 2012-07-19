Ext.define('NextThought.view.content.Base', {
	extend: 'Ext.panel.Panel',
	
	overflowX: 'hidden',
	overflowY: 'auto',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},


	getInsertionPoint: function(){
		//only call after render!
		return this.getTargetEl().down('div[id$=targetEl]');
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

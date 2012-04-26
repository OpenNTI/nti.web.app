Ext.define('NextThought.view.content.Base', {
	extend: 'Ext.panel.Panel',
	
	autoScroll:true,
	frame: false,
	border: false,
	defaults: {frame: false, border: false},

	relayout: function(){
		if (this.ownerCt) {
			this.ownerCt.doComponentLayout();
		}
		this.doComponentLayout();
		this.doLayout();
		this.fireEvent('resize');
	}
});

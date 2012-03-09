Ext.define('NextThought.view.content.Panel', {
	extend: 'Ext.panel.Panel',
	
	autoScroll:true,
	frame: false,
	border: false,
	defaults: {frame: false, border: false},

	getContainerId: function(){
		return this.containerId;
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

Ext.define( 'NextThought.view.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.view-container',
	layout: 'fit',


	initComponent: function(){
		this.addEvents('activate-view');
		this.callParent(arguments);
		this.mon(this, 'activate', this.activate, this);
	},


	setTitle: function(newTitle){
		this.title = newTitle || this.title;
		if(this.isActive()){
			document.title = this.title || 'NextThought';
		}
	},


	getHash: function(){
		return null;
	},


	isActive: function(){
		return this.ownerCt? (this.ownerCt.getLayout().getActiveItem() === this) : false;
	},


	beforeRestore: function(){ return true; },


	activate: function(){
		if(!this.ownerCt){ console.error('No parent view(ownerCt) was provided. Failing to activate properly'); }

		this.ownerCt.fireEvent('activate-view', this.getId());
		this.setTitle();
		return true;
	},


	deactivate: function(){
		this.fireEvent('view-deactivated');
	},


	relayout: function(){
		this.updateLayout();
	}
});

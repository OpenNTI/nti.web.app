Ext.define( 'NextThought.view.views.Base', {
	extend: 'Ext.container.Container',
	alias: 'widget.view-container',
	layout: 'fit',


	initComponent: function(){
		this.addEvents('activate-view');
		this.callParent(arguments);
	},


	setTitle: function(newTitle){
		this.title = newTitle || this.title;
		if(this.isActive()){
			document.title = this.title || 'NextThought';
		}
	},


	isActive: function(){
		return this.ownerCt? (this.ownerCt.getLayout().getActiveItem() === this) : false;
	},


	activate: function(){
		var me = this,
			ct = me.ownerCt,
			item = 0;

		if(!ct){
			console.error('No container??');
			return false;
		}

		ct.fireEvent('activate-view', me.getId());

		ct.items.each(function(o,i){
			if(o===me) {
				item = i;
				return false;
			}
		},this);

		try{
			try{
				ct.getLayout().getActiveItem().deactivate();
			}
			catch(e){
				console.log('Could not call deactivate on active view',Globals.getError(e));
			}

			ct.getLayout().setActiveItem(item);
			me.fireEvent('view-activated');
			me.setTitle();
		}
		catch(er){
			console.error('Activating View: ', Globals.getError(e));
			return false;
		}
		return true;
	},


	deactivate: function(){
		this.fireEvent('view-deactivated');
	},


	relayout: function(){
		this.ownerCt.doComponentLayout();
		this.doComponentLayout();
		this.doLayout();
	}
});

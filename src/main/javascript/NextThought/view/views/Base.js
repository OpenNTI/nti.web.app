Ext.define( 'NextThought.view.views.Base', {
	extend: 'Ext.container.Container',
	alias: 'widget.view-container',
	layout: 'fit',


	initComponent: function(){
		this.addEvents('activate-view');
		this.callParent(arguments);
	},


	activate: function(){
		var me = this,
			ct = me.ownerCt,
			item = 0;

		if(!ct){
			console.error('No container??');
			return false;
		}

		if (ct.getLayout().getActiveItem() === me) {
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
				console.log('Could not call deactivate on active view',e.stack||e.stacktrace,e);
			}

			ct.getLayout().setActiveItem(item);
			me.fireEvent('view-activated');
		}
		catch(er){
			console.error('Activating View: ', er.message, er.stack||er.stacktrace, er);
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
	},
});

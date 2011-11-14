

Ext.define( 'NextThought.view.modes.Classroom', {
	extend: 'NextThought.view.modes.Mode',
	alias: 	'widget.classroom-mode-container',
	requires: [],
	
    initComponent: function(){
    	var bb= { xtype:'toolbar', cls:'x-docked-noborder-top', items:{focusable:false, disabled:true,text:'&nbsp;'}};
    	
   		this.callParent(arguments);

		this.add({
				cls:'x-focus-pane', flex:1, dockedItems:Ext.clone(bb)
				,

				layout: '',
				items: [

				]

		});
    }
    
});



Ext.define( 'NextThought.view.modes.Reader', {
	extend: 'NextThought.view.modes.Mode',
	
    initComponent: function(){
    	var bb= { xtype: 'toolbar', cls: 'x-docked-noborder-top', items: {focusable: false, disabled:true,text:'&nbsp;',xtype:'button'}};
   		this.callParent(arguments);

		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
    	this.add({ region: 'west', id: 'west-book', xtype: 'leftColumn' });
   		
   		this.add({
    		region: 'center',
    		width: CENTER_WIDTH,
    		
    		border: false,
			frame: false,
			defaults: {border: false, frame: false},
			
			
			activeItem: 0,
			layout: 'card',
    		
    		dockedItems: Ext.create('NextThought.view.navigation.Breadcrumb', {id:'breadcrumb',dock:'top'}),
    		items: Ext.create('NextThought.view.content.Reader', {id:'myReader'})
    	}); 
    	
    	this.add({ region: 'east', id:'east-book', xtype: 'rightColumn'});
		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
    }
    
});
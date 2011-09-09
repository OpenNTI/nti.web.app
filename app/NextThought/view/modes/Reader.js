

Ext.define( 'NextThought.view.modes.Reader', {
	extend: 'NextThought.view.modes.Mode',
	alias: 'widget.reader-mode-container',
	requires: [
        'NextThought.view.navigation.Breadcrumb',
        'NextThought.view.widgets.FilterControlPanel',
        'NextThought.view.widgets.ReaderItemsPanel'
    ],
	
    initComponent: function(){
        this.callParent(arguments);

        var bb= { xtype: 'toolbar', cls: 'x-docked-noborder-top', items: {focusable: false, disabled:true,text:'&nbsp;',xtype:'button'}},
            reader = Ext.create('NextThought.view.content.Reader', {id:'readerPanel'});

		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
    	this.add({ region: 'west', id: 'west-book', xtype: 'leftColumn', columnWidget: {xtype:'filter-control'} });
   		
   		this.add({
            cls: 'x-focus-pane',
    		region: 'center',
    		width: CENTER_WIDTH,
    		
    		border: false,
			frame: false,
			defaults: {border: false, frame: false},
			
			
			activeItem: 0,
			layout: 'card',
    		
    		dockedItems: Ext.create('NextThought.view.navigation.Breadcrumb', {id:'breadcrumb',dock:'top'}),
    		items: reader
    	}); 
    	
    	this.add({ region: 'east', id:'east-book', xtype: 'rightColumn', columnWidget: {xtype:'reader-items'} });
		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });

        this._reader = reader;
    },


    getMainComponent: function(){
        return this._reader;
    }
});
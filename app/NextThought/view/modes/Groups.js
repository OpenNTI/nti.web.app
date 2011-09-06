

Ext.define( 'NextThought.view.modes.Groups', {
	extend: 'NextThought.view.modes.Mode',
	alias:	'widget.groups-mode-container',
	requires: [
			'NextThought.proxy.UserDataLoader'
	],
	
    initComponent: function(){
    	this.callParent(arguments);

		var bb ={ xtype: 'toolbar', cls: 'x-docked-noborder-top', items: {focusable: false, disabled:true,text:'&nbsp;',xtype:'button'}};

		this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
		this.add({ region: 'west', id: 'west-groups', xtype: 'leftColumn', columnWidget: {} });
   		
   		this.add({
			cls: 'x-dataview-panel x-focus-pane',
    		region: 'center',
    		width: CENTER_WIDTH,
    		
    		border: false,
			frame: false,
			defaults: {border: false, frame: false},
    		
    		height: 800,
    		dockedItems: {
				xtype: 'toolbar',
				cls: 'x-docked-noborder-top',
				items: ['Groups:','-',
					{ text: 'Create', createItem: true },
					{ text: 'Delete', disabled: true, deleteItem: true },
					'->',
					{ text: '&nbsp;', focusable: false, disabled:true }
				]
			},
			
			items: {
				store: UserDataLoader.getFriendsListsStore(),
				xtype: 'dataview',
				emptyText: 'No groups available',
				tpl: [
	                '<tpl for=".">',
	                    '<div class="item-wrap" id="{username}">',
		                    '<div class="item">',
		                    	'<img src="{avatarURL}" title="{realname}"></div>',
                    		'<span>{realname}</span></div>',
	                '</tpl>',
	                '<div class="x-clear"></div>'
	            ],
	            multiSelect: false,
	            singleSelect: true,
	            trackOver: true,
	            overItemCls: 'x-item-over',
	            itemSelector: 'div.item-wrap'
			}
    	});
    	
    	this.add({ region: 'east', id:'east-groups', xtype: 'rightColumn', columnWidget: {} }); 
    	this.add({ /*xtype:'tbspacer',*/ flex:1, focusable: false, dockedItems: bb });
    }
    
});
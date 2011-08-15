


Ext.define('NextThought.view.widgets.GroupEditorWindow', {
	extend: 'Ext.window.Window',
	alias : 'widget.group-editor',
	requires: [
			'NextThought.model.User',
			// 'NextThought.model.UnresolvedFriend',
			'NextThought.view.widgets.ShareWithInput'
	],
	
	title: 'Edit Group',
	width: 450, 
	height: 500, 
	modal: true,
	layout: 'fit',
	closeAction: 'destroy',
	defaults:{border: false, defaults:{border: false}},
	
	initComponent: function(){
		this.callParent(arguments);
		this.removeAll();
	    this._store = Ext.create('Ext.data.Store',{
			model: 'NextThought.model.User',
			proxy: 'memory'
		});
	    
	    var n = undefined;
	    if(!this.record.phantom){
	    	this._store.add(this.record.get('friends'));
	    	n = this.record.get('realname');
	    }

	    this.add(
	    	{
	    		xtype: 'form',
	    		bbar: ['->',
	    			{minWidth: 80, text: 'Save', actionName: 'save'},
	    			{minWidth: 80, text: 'Cancel', actionName: 'cancel'}],
	    		layout: 'anchor',
		    	items:[{
		    		xtype: 'textfield',
		    		anchor: '100%',
		    		emptyText: 'Group Name',
		    		allowBlank: false,
		    		name: 'name',
		    		value: n
		    	},{
			    	anchor: '100% -72',
			    	xtype: 'grid',
			        store: this._store,
			        columns: [
			            {
			                text     : '',
			                width    : 30,
			                sortable : false,
			                xtype	 : 'templatecolumn', 
			                tpl		 : '<img src="{avatarURL}" width=24 height=24/>'
			            },
			            {
			                text     : 'Name',
			                flex     : 1,
			                sortable : true,
			                dataIndex: 'realname'
			            },
			            {
			                text     : 'id',
			                flex     : 1,
			                sortable : true,
			                dataIndex: 'Username'
			            },
			            {
			                xtype: 'actioncolumn',
			                width: 30,
			                items: [{
			                    icon   : 'extjs/examples/shared/icons/fam/delete.gif',  // Use a URL in the icon config
			                    tooltip: 'Remove',
			                    scope: this,
			                    handler: function(grid, rowIndex, colIndex) {
			                        this._store.removeAt(rowIndex);
			                    }
			                }]
			            }
			        ],
			        title: 'Members',
			        viewConfig: {
			            stripeRows: true
			        }
				},
				{html:'<hr size=1/>'},
				{xtype: 'sharewithinput', margin: 5, emptyText: 'Search...', allowBlank: true, enableKeyEvents: true }
			]
		});
		
		var s = this.down('sharewithinput');
		s.on('select', this._selectSearch, this);
	},
	
    _selectSearch: function(sel, items) {
    	this._store.add(items);
    	sel.setValue('');
    	sel.clearInvalid();
    }
});
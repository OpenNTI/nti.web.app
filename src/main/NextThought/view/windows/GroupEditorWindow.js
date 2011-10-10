


Ext.define('NextThought.view.windows.GroupEditorWindow', {
	extend: 'Ext.window.Window',
	alias : 'widget.group-editor',
	requires: [
			'NextThought.cache.UserRepository',
			'NextThought.model.User',
			'NextThought.view.form.fields.UserSearchInputField'
	],
	
	title: 'Edit Group',
	width: 450, 
	height: 500, 
	modal: true,
	layout: 'fit',
	closeAction: 'destroy',
	defaults:{border: false, defaults:{border: false}},
	
	initComponent: function(){
        var me= this,
            n = undefined;
        me.callParent(arguments);
        me.removeAll();
        me._store = Ext.create('Ext.data.Store',{
            model: 'NextThought.model.User',
            proxy: 'memory'
        });

	    if(!me.record.phantom){
	    	Ext.each(me.record.get('friends'),
                function(f){
                    me._store.add(UserRepository.getUser(f));
                });

	    	n = me.record.get('realname');
	    }

	    me.add(
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
			                    handler: function(grid, rowIndex, colIndex) {
			                        me._store.removeAt(rowIndex);
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
				{xtype: 'usersearchinput', margin: 5, allowBlank: true, enableKeyEvents: true }
			]
		});
		
		var s = me.down('usersearchinput');
		s.on('select', me._selectSearch, me);
	},

    show: function(){
        this.callParent(arguments);
        var e = this.down('textfield');
        setTimeout(function(){e.focus();}, 500);
    },
	
    _selectSearch: function(sel, items) {
    	this._store.add(items);
    	sel.setValue('');
    	sel.clearInvalid();
    	sel.collapse();
    }
});


Ext.define('NextThought.view.widgets.ItemNavigator', {
	extend:'Ext.panel.Panel',
    requires: ['NextThought.proxy.UserDataLoader'],
    alias: 'widget.item-navigator',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},
	autoScroll: true,
   	
   	initComponent: function(){
        var me = this;
   		me.callParent(arguments);
        //me.el.mask('loading...');
        me._store = Ext.create('Ext.data.Store',{
            model: 'NextThought.model.GenericObject',
			proxy: 'memory'

		});

        setTimeout(function(){
            me.ownerCt.on('beforeshow', me._onshow, me);
            me.reload();
        }, 0);

        me.add(
            {
                anchor: '100% 100%',
                xtype: 'grid',
                store: me._store,
                columns: [
                    {
                        text     : 'Type',
                        flex     : 1,
                        sortable : true,
                        dataIndex: 'Class'
                    },
                    {
                        text     : 'Text',
                        flex     : 3,
                        sortable : true,
                        dataIndex: 'text'
                    },
                    {
                        text     : 'Last Modified',
                        flex     : 1,
                        sortable : true,
                        xtype    : 'datecolumn',
                        format   : 'D M d, Y h:i',
                        dataIndex: 'Last Modified'
                    },
                    {
                        xtype: 'actioncolumn',
                        width: 30,
                        items: [{
                            icon   : 'extjs/examples/shared/icons/fam/delete.gif',  // Use a URL in the icon config
                            tooltip: 'Remove',
                            scope: me,
                            handler: function(grid, rowIndex, colIndex) {
                                var s = me._store,
                                    r = s.getAt(rowIndex);

                                s.removeAt(rowIndex);
                                me.fireEvent('annotation-destroyed', r.get('OID'));
                                r.destroy();
                            }
                        }]
                    }
                ],
                viewConfig: {
                    stripeRows: true
                }
            }
        );
   	},

    _onshow: function() {
        this.reload();
    },

    reload: function() {
       //this._store.removeAll(false);
       UserDataLoader.getItems({
            scope: this,
            success: this.itemsLoaded
        });
    },

    itemsLoaded: function(bins) {
        var me = this,
            OIDs = {},
            id = null,
            s = this._store,
            key;

        for (key in bins) {
            if (!bins.hasOwnProperty(key)) continue;
            Ext.each(bins[key], function(r){
                id = r.get('OID');
                OIDs[id]=true;

                if(s.indexOfId(id)<0)
                    s.add(r);
            },
            me);
        }
        //remove records
        s.each(function(r){
            if(!!OIDs[r.get('OID')]) return;

            s.remove(r);
        },me);

        if (me.el.isMasked())
            me.el.unmask();
    }
});

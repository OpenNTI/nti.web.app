

Ext.define('NextThought.view.widgets.ItemNavigator', {
	extend:'Ext.panel.Panel',
    requires: ['NextThought.proxy.UserDataLoader'],
    alias: 'widget.item-navigator',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},
    layout: 'anchor',

    dockedItems:{
        xtype: 'toolbar',
        items: [ '->',
            {
                xtype: 'triggerfield',
                emptyText: 'Search...',
                enableKeyEvents: true,
                trigger1Cls: 'x-form-clear-trigger',
                trigger2Cls: 'x-form-search-trigger',
                width: 150,
                onTrigger1Click:function(){this.reset();this.onTrigger2Click();},
                onTrigger2Click:function(){this.fireEvent('keypress',this);}
            }
        ]
    },

    initComponent: function(){
        var me = this,
            actionColumn = {
                xtype: 'actioncolumn',
                width: 40,
                hideable: false,
                sortable: false,
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
                },
                {
                    icon   : 'extjs/examples/shared/icons/fam/application_go.png',  // Use a URL in the icon config
                    tooltip: 'Go to',
                    scope: me,
                    handler: function(grid, rowIndex, colIndex) {
                        var r = me._store.getAt(rowIndex);
                        grid.fireEvent('itemdblclick', grid, r, null, rowIndex);
                    }
                }]
            };

   		me.callParent(arguments);
        //me.el.mask('loading...');
        me._store = Ext.create('Ext.data.Store',{
            id: 'mystuff',//make it accessible for debugging in the browser console by putting an id on it, so we can perform this: var a = Ext.StoreManager.get('mystuff')
            model: 'NextThought.model.GenericObject',
            groupField: 'Class',
			proxy: 'memory'

		});

        setTimeout(function(){
            me.ownerCt.on('beforeshow', me._onshow, me);
            me.reload();
        }, 0);

        me.add({
            xtype: 'grid',
            store: me._store,
            anchor: '100% 100%',
            enableColumnHide: false,
            features: [{
                ftype:'grouping',
                enableGroupingMenu: false,
                groupHeaderTpl: '{name}s ({rows.length})'
            }],
            columns: [
                actionColumn,
                {
                    text     : 'Text',
                    flex     : 1,
                    sortable : true,
                    dataIndex: 'text',
                    xtype    : 'templatecolumn',
                    tpl      : '{[values.text.replace(/\<.*?\>/ig,"")]}'

                },
                {
                    text     : 'Last Modified',
                    width    : 130,
                    sortable : true,
                    xtype    : 'datecolumn',
                    format   : 'D M d, Y h:i',
                    dataIndex: 'Last Modified'
                }

            ],
            viewConfig: {
                stripeRows: true
            }
        });

        var trigger = me.query('triggerfield')[0]
        trigger.on('keypress',me._filter, me);
        trigger.on('specialkey',me._filter, me);
   	},


    _filter: function(t){
        this._store.clearFilter();
        this._store.filter('text',
            new RegExp(Ext.String.escapeRegex(t.getValue())))
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

                if (!id) return;

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

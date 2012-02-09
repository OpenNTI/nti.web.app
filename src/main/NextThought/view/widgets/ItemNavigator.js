

Ext.define('NextThought.view.widgets.ItemNavigator', {
	extend:'Ext.panel.Panel',
	requires: [
		'Ext.form.field.Trigger',
		'Ext.grid.Panel',
		'Ext.grid.column.Action',
		'Ext.grid.column.Date',
		'Ext.grid.column.Template',
		'Ext.grid.feature.Grouping',
		'NextThought.proxy.Search'
	],
	alias: 'widget.item-navigator',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},
	layout: 'anchor',

	dockedItems:{
		xtype: 'toolbar',
		items: [// '->',
			{
				xtype: 'triggerfield',
				emptyText: 'Search...',
				enableKeyEvents: true,
				trigger1Cls: 'x-form-clear-trigger',
				trigger2Cls: 'x-form-search-trigger',
				//width: 150,
				flex: 1,
				onTrigger1Click:function(){this.reset();this.onTrigger2Click();},
				onTrigger2Click:function(){this.fireEvent('keypress',this);}
			}
		]
	},

	initComponent: function(){
		var me = this, trigger,
			gotoActionColumn = {
				xtype: 'actioncolumn',
				width: 20,
				hideable: false,
				sortable: false,
				items: [{
					icon   : 'ext-4.0.7/examples/shared/icons/fam/application_go.png',  // Use a URL in the icon config
					tooltip: 'Go to',
					scope: me,
					handler: function(grid, rowIndex, colIndex) {
						var r = me.store.getAt(rowIndex);
						grid.fireEvent('itemdblclick', grid, r, null, rowIndex);
					}
				}]
			},
			deleteActionColumn = {
				xtype: 'actioncolumn',
				width: 20,
				hideable: false,
				sortable: false,
				items: [{
					icon   : 'ext-4.0.7/examples/shared/icons/fam/delete.gif',  // Use a URL in the icon config
					tooltip: 'Remove',
					scope: me,
					handler: function(grid, rowIndex, colIndex) {
						var s = me.store,
							r = s.getAt(rowIndex);

						s.removeAt(rowIndex);
						me.fireEvent('annotation-destroyed', r.get('TargetOID'), r.get('ContainerId'));
					}
				}]
			};

		me.callParent(arguments);
		//me.el.mask('loading...');
		me.store = Ext.create('Ext.data.Store',{
			storeId: 'nav',
			model: 'NextThought.model.Hit',
			groupField: 'Type',
			autoLoad: true,
			remoteFilter: true,
			remoteGroup: false,
			remoteSort: false,
			proxy: {
				type: 'search',
				url: $AppConfig.service.getUserDataSearchURL(),
				reader: 'nti'
			}
		});

		me.add({
			xtype: 'grid',
			store: me.store,
			anchor: '100% 100%',
			enableColumnHide: false,
			features: [{
				ftype:'grouping',
				enableGroupingMenu: false,
				groupHeaderTpl: '{name}s ({rows.length})'
			}],
			columns: [
				gotoActionColumn,
				{
					text	 : 'Text',
					flex	 : 2,
					sortable : true,
					dataIndex: 'Snippet',
					xtype	: 'templatecolumn',
					tpl	  : '{[values.text?values.text.replace(/<.*?>/ig, "") : "" ]}'

				},
				{
					text	 : 'Container',
					flex	 : 1,
					sortable : true,
					//xtype	: 'gridcolumn',
					xtype	: 'templatecolumn',
					dataIndex: 'ContainerId',
					tpl	  : '{[Library.findLocationTitle(values.ContainerId)]}'
				},
				{
					text	 : 'Last Modified',
					width	: 130,
					sortable : true,
					xtype	: 'datecolumn',
					format   : 'D M d, Y h:i',
					dataIndex: 'Last Modified'
				},
				deleteActionColumn

			],
			viewConfig: {
				stripeRows: true
			}
		});

		trigger = me.query('triggerfield')[0];
		trigger.on('keypress',me.filter, me);
		trigger.on('specialkey',me.filter, me);
	},


	filter: function(t){
		this.store.filters.clear();
		this.store.filter('search',t.getValue());
	},


	reload: function() {
		this.store.load();
	}

});

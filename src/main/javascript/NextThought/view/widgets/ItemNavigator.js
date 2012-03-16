

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
			iconTpl = new Ext.XTemplate(
					'<span title="go to {[this.getClass(values)]}" class="go-to-icon-default go-to-icon-{[this.getClass(values)]}">&nbsp;</span>',
					{
						compiled: true,
						disableFormats: true,
						getClass: function(values){
							return values ? values.Type : '';
						}
					}),
			snippetTpl = new Ext.XTemplate(
					'{[this.getTemplate(values)]}',
					{
						compiled: true,
						disableFormats: true,
						getTemplate: function(values){
							if (values.Type === 'MessageInfo'){
								return 'Transcript';
							}
							return values.Snippet;
						}
					}),
			containerTpl = new Ext.XTemplate(
					'{[this.getTemplate(values)]}',
					{
						compiled: true,
						disableFormats: true,
						getTemplate: function(values){
							if (values.Type === 'MessageInfo'){
								return 'transcript';
							}
							return Library.findLocationTitle(values.ContainerId);
						}
					}),
			deleteActionColumn = {
				xtype: 'actioncolumn',
				width: 20,
				hideable: false,
				sortable: false,
				items: [{
					iconCls: 'delete-action',
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

		me.store.on('load',function(){
			me.store.remoteFilter = false;
			me.store.filter([{
				filterFn: (function(){
					var seen = {};
					return function(item) {
						if(item.get('Type')==='MessageInfo'){
							var cid = item.get('ContainerId');
							if(seen.hasOwnProperty(cid)){
								return false;
							}
							seen[cid] = 1;
						}
						return true;
					}
				}())
			}],null);
			me.store.remoteFilter = true;
		},me);

		me.store.getGroupsOld = me.store.getGroups;
		me.store.getGroups = function(){
			var r = this.getGroupsOld.apply(this,arguments),
				i = r.length-1;
			for(;i>=0;i--){
				if(r[i].name==='MessageInfo'){
					r[i].name = 'Chat';
				}
			}
			return r;
		};

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
				{
					xtype: 'templatecolumn',
					width: 25,
					hideable: false,
					sortable: false,
					fixed: true,
					resizable: false,
					tpl: iconTpl
				},
				{
					text	 : 'Text',
					flex	 : 2,
					sortable : true,
					dataIndex: 'Snippet',
					xtype	: 'templatecolumn',
					tpl	  : snippetTpl
				},
				{
					text	 : 'Container',
					flex	 : 1,
					sortable : true,
					//xtype	: 'gridcolumn',
					xtype	: 'templatecolumn',
					dataIndex: 'ContainerId',
					tpl	  : containerTpl
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

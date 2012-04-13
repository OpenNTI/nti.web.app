

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
	layout: 'fit',

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
				onTrigger2Click:function(){this.fireEvent('keyup',this);}
			}
		]
	},

	initComponent: function(){
		this.store = Ext.getStore('MyStuff');

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
				xtype: 'templatecolumn',
				width: 25,
				hideable: false,
				sortable: false,
				tpl: new Ext.XTemplate(
					'<img alt="Remove" src="{[Ext.BLANK_IMAGE_URL]}" class="x-action-col-icon {[this.getClass(values)]}" data-qtip="Remove">',
					{
						compiled: true,
						disableFormats: true,
						getClass: function(values){
							if(/MessageInfo/i.test(values.Type)){
								return '';
							}
							return 'delete-action';
						}
					}),
				processEvent : function(type, view, cell, recordIndex, cellIndex, e){
					var match = e.getTarget().className.match(/delete/i), r, s = me.store;

					if(match && type==='click'){
						r = s.getAt(recordIndex);
						s.removeAt(recordIndex);

						me.fireEvent('annotation-destroyed', r.get('TargetOID'), r.get('ContainerId'));
					}
					return Ext.grid.column.Template.prototype.processEvent.apply(this,arguments);
				}
			};

		me.callParent(arguments);

		me.add({
			xtype: 'grid',
			store: me.store,
			scroll: false,
			viewConfig: {
				stripeRows: true,
				style: { overflow: 'auto', overflowX: 'hidden'}
			},
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

			]
		});

		trigger = me.query('triggerfield')[0];
		trigger.on('keyup',me.filter, me);
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

Ext.define('NextThought.view.widgets.classroom.ResourceView', {
	extend: 'Ext.view.View',
	alias: 'widget.classroom-resource-view',
	requires:[
		'NextThought.model.Link'
	],

	cls: 'x-class-resourceview-panel',
	deferEmptyText: false,
	emptyText: '<div class="empty">&nbsp;</div>',

	dataTypeToIcon: {
		'application/vnd.nextthought.classscipt' : 'resource-script'
	},

	tplGrid: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="item-wrap">',
				'<div class="item">',
					'<img src="{[Ext.BLANK_IMAGE_URL]}" title="{[this.getName(values,xindex)]}">',
					'<span>{[this.getName(values,xindex)]}</span>',
				'</div>',
			'</div>',
		'</tpl>',
		'<div class="x-clear"></div>',
		{
			compile: true,
			getName: function(values,x) {
				return values.href.split('?')[0].split('/').pop();
			}
		}
	),

	tplDetails: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="item-wrap details">',
				'<div class="item">', //row
					'<img src="{[Ext.BLANK_IMAGE_URL]}" title="{[this.getName(values,xindex)]}">',
					'<span>{[this.getName(values,xindex)]}</span>',
					'<span>{type}</span>',
				'</div>',
			'</div>',
		'</tpl>',
		'<div class="x-clear"></div>',
		{
			compile: true,
			getName: function(values,x) {
				return values.href.split('?')[0].split('/').pop();
			}
		}
	),


	multiSelect: false,
	singleSelect: true,
	trackOver: true,
	overItemCls: 'x-item-over',
	itemSelector: 'div.item-wrap',


	initComponent: function(){
		//create dynamic store:
		this.store = Ext.create('Ext.data.Store', {
			model: 'NextThought.model.Link',
			proxy: 'memory'
		});

		//use details tmpl at default
		this.tpl = this.tplDetails;

		this.callParent(arguments);
	},

	setRecord: function (r) {
		this.store.loadRawData(r.getLinks('enclosure'), false);
	}
});

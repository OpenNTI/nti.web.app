

Ext.define('NextThought.view.widgets.classroom.ResourceView', {
	extend: 'Ext.view.View',
	alias: 'widget.classroom-resource-view',
	requires:[
		'NextThought.model.Link'
	],

	cls: 'x-class-resourceview-panel',
	emptyText: 'No resources available',

	dataTypeToIcon: {
		'application/vnd.nextthought.classscipt' : 'resource-script'
	},

	tplGrid: new Ext.XTemplate([
		'<tpl for=".">',
			'<div class="item-wrap">',
				'<div class="item">',
					'<img src="{[Ext.BLANK_IMAGE_URL]}" title="{this.getName(href)}"></div>',
				'<span>{this.getName(href)}</span></div>',
		'</tpl>',
		'<div class="x-clear"></div>'
	]),

	tplDetails: new Ext.XTemplate([
		'<tpl for=".">',
			'<div class="item-wrap details">',
				'<div class="item">', //row
					'<img src="{[Ext.BLANK_IMAGE_URL]}" title="{this.getName(href)}">',
					'<span>{this.getName(href)}</span>',
					'<span>{mimetype}</span>',
			'</div>',
			'</div>',

		'</tpl>',
		'<div class="x-clear"></div>',
		{
			compile: true,
			// member functions:
			getName: function(href){
				var a = href.split('?')[0].split('/');
				return a.pop();
			}
		}
	]),


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

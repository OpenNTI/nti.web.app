Ext.define('NextThought.view.widgets.GroupsView', {
	extend: 'Ext.view.View',
	alias: 'widget.groups-view',

	cls: 'x-groupview-panel',
	emptyText: 'No groups available',

	tpl: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="item-wrap" id="{username}">',
				'<div class="item">',
					'<canvas title="{realname}"></canvas></div>',
				'<span>{realname}</span></div>',
		'</tpl>',
		'<div class="x-clear"></div>',
		{

		}
	),

	multiSelect: false,
	singleSelect: true,
	trackOver: true,
	overItemCls: 'x-item-over',
	itemSelector: 'div.item-wrap',

	initComponent: function(){
		this.store = Ext.getStore('FriendsList');
		this.callParent(arguments);
		this.on('refresh',this.onRefresh,this);
	},

	onRefresh: function(){
		function process(node,index){
			var record = this.getRecord(node),
				canvas = Ext.DomQuery.selectNode('canvas',node),
				width = Ext.fly(canvas).getWidth();

			canvas.width = canvas.height = width;

			record.drawIcon(canvas);
		}

		Ext.each(this.getNodes(), process,this);
	}
});

Ext.define('NextThought.view.widgets.GroupsView', {
	extend: 'Ext.view.View',
	alias: 'widget.groups-view',

	cls: 'x-groupview-panel',
	emptyText: 'No groups available',

	tpl: [
		'<tpl for=".">',
			'<div class="item-wrap" id="{username}">',
				'<div class="item">',
					'<img src="{avatarURL}" title="{realname}"></div>',
				'<span>{realname}</span></div>',
		'</tpl>',
		'<div class="x-clear"></div>'
	],
	multiSelect: false,
	singleSelect: true,
	trackOver: true,
	overItemCls: 'x-item-over',
	itemSelector: 'div.item-wrap',

	initComponent: function(){
		this.store = Ext.getStore('FriendsList');
		this.callParent(arguments);
	}
});

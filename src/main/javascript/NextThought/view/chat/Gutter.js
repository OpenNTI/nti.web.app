Ext.define('NextThought.view.chat.Gutter',{
	extend: 'Ext.container.Container',
	alias: 'widget.chat-gutter',

	width: 36,
	ui: 'chat-window',
	cls: 'gutter',

	defaults: {
		ui: 'chat-window'
	},


	hide: function(){
		this.ownerCt.addCls('no-gutter');
		return this.callParent();
	},


	show: function(){
		this.ownerCt.removeCls('no-gutter');
		return this.callParent();
	},


	updateList: function(users){
		var list = [];

		Ext.each(users,function(u){
			list.push({
				xtype: 'image',
				src:u.get('avatarURL'),
				width: 36,
				height: 36,
				alt:u.getName()
			});
		});

		list.push({
			xtype: 'button',
			scale: 'large',
			iconCls: 'add people'
		}, {
			xtype: 'button',
			scale: 'large',
			iconCls: 'add whiteboard'
		});

		this.removeAll(true);
		this.add(list);
	}
});

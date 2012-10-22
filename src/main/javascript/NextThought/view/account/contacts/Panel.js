Ext.define('NextThought.view.account.contacts.Panel',{
	extend: 'Ext.panel.Panel',
	requires: [
		'Ext.Action',
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.view.account.contacts.Card'
	],

	alias: 'widget.contacts-panel',
	ui: 'contacts-panel',
	cls: 'contacts-panel',

	collapsible: true,
	hideCollapseTool: true,
	collapsedCls: 'collapsed',

	frame: false,
	border: false,
	unstyled: true,
	showCount: true,
	defaultType: 'contact-card',
	tools:[{
	    type:'options',
		width: 20,
		height: 20,
	    tooltip: 'Options',
	    handler: function(event, toolEl, panel){ panel.up('contacts-panel').showMenu(toolEl); }
	}],

	initComponent: function(){
		var g = this.associatedGroup;
		if(!g){
			this.tools = null;
		}
		this.callParent(arguments);
		this.setTitle(this.title);

		this.deleteGroupAction = new Ext.Action({
			text: 'Delete Group',
			scope: this,
			handler: this.deleteGroup,
			itemId: 'delete-group',
			ui: 'nt-menuitem', plain: true,
			hidden: g && !g.getLink('edit')
		});


		this.groupChatAction = new Ext.Action({
			text: 'Group Chat',
			scope: this,
			handler: this.chatWithGroup,
			itemId: 'group-chat',
			ui: 'nt-menuitem', plain: true,
			hidden: !$AppConfig.service.canChat() || !g || g.getFriendCount() === 0
		});

		this.menu = Ext.widget('menu',{
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			hideMode: 'display',
			parentItem: this,
			items: [
				this.deleteGroupAction,
				this.groupChatAction
			]
		});

		this.mon(this.menu, {
			scope: this,
			'mouseleave': this.startHide,
			'mouseenter': this.stopHide
		});
	},


	destroy: function(){
		this.menu.destroy();
		return this.callParent(arguments);
	},


	showMenu: function(toolEl){
		this.menu.showBy(toolEl,'tr-tl',[0,0]);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.getHeader().on('click',
			function(){
				//panel collapse causes permanent failure if there are no items, avoid that.
				if (this.items.length > 0) {
					this.toggleCollapse();
				}
			}
			,this);
	},

	startHide: function(){
		var me = this;
		me.stopHide();
		me.leaveTimer = setTimeout(function(){me.menu.hide();}, 500);
	},


	stopHide: function(){ clearTimeout(this.leaveTimer); },


	setTitle: function(title){
		var itemsShown = 0;

		this.title = title;

		Ext.each(this.items.items, function(x){
			if (!x.hidden){itemsShown++;}
		}, this);

		if(this.showCount){
			this.title = Ext.String.format('{0} ({1})',title,itemsShown);
		}

		if (this.rendered) {
			this.getHeader().setTitle(this.title);
		}
		return this;
	},

	updateTitle: function(){
		this.setTitle(this.initialConfig.title);
	},

	setUsers: function(users){
		var p = [],
			g = this.associatedGroup;

		if(Ext.isArray(users)){
			Ext.each(users,function(u){ p.push({user: u, group: g}); });
		}
		else {
			Ext.Object.each(users,function(n,u){ p.push({user: u, group: g}); });
		}
		this.removeAll(true);
		this.add(p);
		this.updateTitle();
	},

	addUser: function(user){
		var existing = this.down('[username='+user.get('Username')+']');
		if(!existing){
			this.add({user: user, group: this.associatedGroup});
			this.updateTitle();
		}
	},

	removeUser: function(user) {
		var name = (user && user.isModel) ? user.get('Username') : user,
			existing = this.down('[username='+name+']');
		if (existing){
			this.remove(existing, true);
			this.updateTitle();
		}
	},


	deleteGroup: function(){
		this.fireEvent('delete-group',this.associatedGroup);
	},


	chatWithGroup: function(){
		if(this.associatedGroup.getFriendCount() > 0){
			this.fireEvent('group-chat', this.associatedGroup);
		}
	}

});

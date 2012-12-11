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
		var g = this.associatedGroup,
			listOrGroup = g && g.get('IsDynamicSharing') ? 'Group' : 'List';
		if(!g){
			this.tools = null;
		}
		this.callParent(arguments);
		this.setTitle(this.title);

		this.deleteGroupAction = new Ext.Action({
			text: 'Delete '+listOrGroup,
			scope: this,
			handler: this.deleteGroup,
			itemId: 'delete-group',
			ui: 'nt-menuitem', plain: true,
			hidden: g && !g.getLink('edit')
		});

		this.leaveGroupAction = new Ext.Action({
			text: 'Leave '+listOrGroup,
			scope: this,
			handler: this.leaveGroup,
			itemId: 'leave-group',
			ui: 'nt-menuitem', plain: true,
			hidden: g && !g.getLink('my_membership')
		});

		this.groupChatAction = new Ext.Action({
			text: 'Chat With '+listOrGroup,
			scope: this,
			handler: this.chatWithGroup,
			itemId: 'group-chat',
			ui: 'nt-menuitem', plain: true,
			hidden: !$AppConfig.service.canChat() || !g || !isMe(g.get('Creator')) || g.getFriendCount() === 0
		});

		this.getGroupCodeAction =  new Ext.Action({
			text: 'Group Code',
			scope: this,
			handler: this.getGroupCode,
			itemId: 'get-group-code',
			ui: 'nt-menuitem', plain: true,
			hidden: !g || !g.getLink('default-trivial-invitation-code')
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
				this.leaveGroupAction,
				this.deleteGroupAction,
				this.groupChatAction,
				this.getGroupCodeAction
			]
		});

		this.mon(this.menu, {
			scope: this,
			'mouseleave': this.startHide,
			'mouseenter': this.stopHide
		});

		this.forcefullyRemoveUser =  new Ext.Action({
			text: 'Remove User',
			scope: this,
			handler: this.forcefullyRemoveUser,
			itemId: 'remove-user',
			ui: 'nt-menuitem', plain: true
		});

		this.userMenu = Ext.widget('menu',{
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			hideMode: 'display',
			parentItem: this,
			items: [
				this.forcefullyRemoveUser
			]
		});

		this.mon(this.userMenu, {
			scope: this,
			'mouseleave': this.startHideUser,
			'mouseenter': this.stopHideUser
		});

		this.on('nibClicked', this.nibClicked, this);
	},


	destroy: function(){
		this.menu.destroy();
		return this.callParent(arguments);
	},


	showMenu: function(toolEl){
		var g = this.associatedGroup, me = this;

		//Update group chat state.
		//TODO listen for changes instead of rechecking each time
		if(g){
			friends = g.get('friends');
			if(Ext.isEmpty(friends)){
				this.groupChatAction.setDisabled(true);
			}
			else{
				UserRepository.getUser(friends, function(rFriends){
					var canGroupChat = Ext.Array.some(rFriends, function(f){
											return f.get('Presence') === 'Online';
									   });
					me.groupChatAction.setDisabled(!canGroupChat);
				});
			}
		}

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

	startHideUser: function(){
		var me = this;
		me.stopHideUser();
		me.leaveTimerUser = setTimeout(function(){me.userMenu.hide();}, 500);
	},

	stopHideUser: function(){ clearTimeout(this.leaveTimerUser); },

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

	//The nib is used to show either the group manangement screen or a remove user button for dfls
	shouldHideUserNib: function(){
		//No associated group means we want the nib
		if(!this.associatedGroup){
			return false;
		}

		//For dfls we show the nib if we are the creator
		return this.associatedGroup.get('IsDynamicSharing') && !isMe(this.associatedGroup.get('Creator'));
	},

	setUsers: function(users){
		var p = [],
			g = this.associatedGroup,
			hide = this.shouldHideUserNib();

		if(Ext.isArray(users)){
			Ext.each(users,function(u){ p.push({user: u, group: g, hideNib: hide}); });
		}
		else {
			Ext.Object.each(users,function(n,u){ p.push({user: u, group: g, hideNib: hide}); });
		}
		this.removeAll(true);
		this.add(p);
		this.updateTitle();
	},

	addUser: function(user){
		var existing = this.down('[username='+user.get('Username')+']');
		if(!existing){
			this.add({user: user, group: this.associatedGroup, hideNib: this.shouldHideUserNib()});
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
		var me = this,
			msg = 'The '+(this.associatedGroup.get('IsDynamicSharing')?'group':'list')+' '+ this.associatedGroup.get('displayName') + ' will be permanently deleted...';

		Ext.Msg.show({
			msg: msg,
			buttons: 9, // bitwise result of: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function(str){
				if(str === 'ok'){
					me.fireEvent('delete-group',me.associatedGroup);
				}
			}
		});
	},


	chatWithGroup: function(){
		if(this.associatedGroup.getFriendCount() > 0){
			this.fireEvent('group-chat', this.associatedGroup);
		}
	},

	getGroupCode: function(){
		if(this.associatedGroup.getLink('default-trivial-invitation-code')){
			this.fireEvent('get-group-code', this.associatedGroup);
		}
	},

	leaveGroup: function(){
		if(this.associatedGroup.getLink('my_membership')){
			this.fireEvent('leave-group', this.associatedGroup);
		}
	},

	forcefullyRemoveUser: function(t){
		var user = t.up('menu').user;
		this.fireEvent('remove-contact', this.associatedGroup, user.getId());
	},

	nibClicked: function(card, record, nib){
		if(!this.associatedGroup || !this.associatedGroup.get('IsDynamicSharing')){
			NextThought.view.account.contacts.management.Popout.popup(record, card.el.down('img:not(.nib)'), card.el, [-10,-18]);
		}
		else{
			this.userMenu.user = record;
			this.userMenu.showBy(nib,'tr-tl',[0,0]);
		}
	}

});

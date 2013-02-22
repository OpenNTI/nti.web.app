/**
 *  We assume that the component that mixes this in should implement 'createUserComponent' and the its children should
 *  implement 'getUserObject' method.
 */
Ext.define('NextThought.mixins.UserContainer', {

	setupActions: function(group){
		var listOrGroup = group && Ext.String.capitalize(group.readableType),
			menuCfg = {
				ui: 'nt',
				plain: true,
				showSeparator: false,
				shadow: false,
				frame: false,
				border: false,
				hideMode: 'display',
				parentItem: this
			};


		this.deleteGroupAction = new Ext.Action({
			text: 'Delete '+listOrGroup,
			scope: this,
			handler: Ext.bind(this.deleteGroup,this,[group]),
			itemId: 'delete-group',
			ui: 'nt-menuitem', plain: true,
			hidden: group && !group.getLink('edit')
		});

		this.leaveGroupAction = new Ext.Action({
			text: 'Leave '+listOrGroup,
			scope: this,
			handler: Ext.bind(this.leaveGroup,this,[group]),
			itemId: 'leave-group',
			ui: 'nt-menuitem', plain: true,
			hidden: group && !group.getLink('my_membership')
		});

		this.groupChatAction = new Ext.Action({
			text: 'Chat With '+listOrGroup,
			scope: this,
			handler: Ext.bind(this.chatWithGroup,this,[group]),
			itemId: 'group-chat',
			ui: 'nt-menuitem', plain: true,
			hidden: !$AppConfig.service.canChat() || !group || !isMe(group.get('Creator')) || group.getFriendCount() === 0
		});

		this.getGroupCodeAction =  new Ext.Action({
			text: 'Group Code',
			scope: this,
			handler: Ext.bind(this.getGroupCode,this,[group]),
			itemId: 'get-group-code',
			ui: 'nt-menuitem', plain: true,
			hidden: !group || !group.getLink('default-trivial-invitation-code')
		});

		this.forcefullyRemoveUserAction = new Ext.Action({
			text: 'Remove User',
			scope: this,
			handler: Ext.bind(this.forcefullyRemoveUser,this,[group],1),
			itemId: 'remove-user',
			ui: 'nt-menuitem', plain: true
		});

		this.userMenu = Ext.widget('menu',Ext.apply({
			items: [
				this.forcefullyRemoveUserAction
			]
		},menuCfg));

		this.menu = Ext.widget('menu',Ext.apply({
			items: [
				this.leaveGroupAction,
				this.deleteGroupAction,
				this.groupChatAction,
				this.getGroupCodeAction
			]
		},menuCfg));

		this.mon(this.menu, this.getMenuHideHandlers(this.menu));
		this.mon(this.userMenu, this.getMenuHideHandlers(this.userMenu));

		this.updateChatState(group);
	},


	cleanupActions: function(){
		this.userMenu.destroy();
		this.menu.destroy();
	},


	getMenuHideHandlers: function(menu){
		var leave;
		function hide(){menu.hide();}
		function start(){ stop(); leave = setTimeout(hide, 500); }
		function stop(){ clearTimeout(leave); }
		return {
			mouseleave: start,
			mouseenter: stop
		};
	},


	updateChatState: function(group){
		var me = this,
			friends;

		function test(f){ return f.get('Presence') === 'Online'; }

		//Update group chat state.
		//TODO listen for change events instead of rechecking each time
		if(group){
			friends = group.get('friends');
			if(Ext.isEmpty(friends,false)){ this.groupChatAction.setDisabled(true); }
			else{
				UserRepository.getUser(friends, function(rFriends){
					var canGroupChat = Ext.Array.some(rFriends, test);
					me.groupChatAction.setDisabled(!canGroupChat);
				});
			}
		}
	},


	//Users isn't very big here so do the naive thing
	indexToInsertAt: function(users, newUser){
		var idx = 0, me = this;
		Ext.Array.each(users, function(u){
			if(me.userSorterFunction(u, newUser) < 0){
				idx++;
				return true;
			}
			return false;
		});
		return idx;
	},


	addUser: function(user){
		var existing = this.down('[username='+user.get('Username')+']'), users;
		if(!existing){
			//Figure out where we need to insert it
			users = Ext.Array.map(this.query('[username]')||[], function(u){return u.getUserObject();});
			this.insert(this.indexToInsertAt(users, user), this.createUserComponent(user));
			return true;
		}
		return false;
	},


	removeUser: function(user) {
		var name = (user && user.isModel) ? user.get('Username') : user,
			existing = this.down('[username='+name+']');
		if (existing){
			this.remove(existing, true);
			return true;
		}
		return false;
	},


	//Sort the users first by presense (online, offline) then
	//alphabetically withing that
	userSorterFunction: function(a, b){
		var aPresence = a.get('Presence'),
			bPresence = b.get('Presence'),
			aName = a.get('displayName'),
			bName = b.get('displayName'),
			presenceResult, nameResult;

		presenceResult = bPresence.localeCompare(aPresence);
		if(presenceResult !== 0){
			return presenceResult;
		}

		return aName.localeCompare(bName);
	},


	deleteGroup: function(group){
		var me = this,
			msg = Ext.DomHelper.markup(['The ', group.readableType, ' ',
									{tag: 'span', cls: 'displayname', html: group.get('displayName')},
									' will be permanently deleted...']);
		function cb(str){
			if(str === 'ok'){
				me.fireEvent('delete-group',me.associatedGroup);
			}
		}

		this.areYouSure(msg,cb);
	},


	chatWithGroup: function(group){
		if(group.getFriendCount() > 0){
			this.fireEvent('group-chat', group);
		}
	},


	getGroupCode: function(group){
		if(group.getLink('default-trivial-invitation-code')){
			this.fireEvent('get-group-code', group);
		}
	},


	leaveGroup: function(group){
		if(group.getLink('my_membership')){
			this.fireEvent('leave-group', group);
		}
	},


	forcefullyRemoveUser: function(item,group){
		var me = this,
			menu = item && item.up ? item.up('menu') : null,
			//use the menu's reference, if we called with user instead, use it
			user = menu ? menu.user : item && item.isModel ? item : null,
			msg = Ext.DomHelper.markup([
				{tag: 'span', cls: 'displayname', html: user.get('displayName')},
				' will no longer be a member of ',
				{tag: 'span', cls: 'displayname', html: group.get('displayName')}
			]);

		function cb(str){
			if(str === 'ok'){
				me.fireEvent('remove-contact', group, user.getId());
			}
		}

		this.areYouSure(msg,cb);
	},


	areYouSure: function(msg,callback){
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: msg,
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: callback
		});
	}
});

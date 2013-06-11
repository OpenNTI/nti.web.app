describe("Chat Window Tests", function(){
	var testBody, oldUserRepo, logView, chatView, list, store;

	beforeEach(function(){
		//mock out the user repo
		var userRepo = NTITestUtils.newInstanceOfSingleton(UserRepository);

		oldUserRepo = UserRepository;
		UserRepository = userRepo;

		store = Ext.getStore('PresenceInfo');

		testBody = document.createElement('div');
		document.body.appendChild(testBody);
	});

	afterEach(function(){
		//put the user repo back
		UserRepository = oldUserRepo;
		document.body.removeChild(testBody);
	});

	function createUser(username, additional){
		var cfg = Ext.apply(additional || {},{
			Username: username
		});

		return  NextThought.model.User.create(cfg);
	}

	function createRoomInfo(cid, occupants){
		return NextThought.model.RoomInfo.create({ Occupants: occupants, id: cid});
	}

	function mockDown(name){
		if(name === 'chat-log-view'){
			return logView;
		}else if(name === 'chat-entry'){
			return chatView;
		}else if(name === 'chat-gutter'){
			return list;
		}
	}

	describe('One-on-one chat', function(){
		var chatWindow, roomInfo, occupants, users;


		beforeEach(function(){
			//cache users
			var user1 = createUser('windowUser');

			users = [];
			users.push($AppConfig.userObject);
			users.push(user1);
			UserRepository.cacheUser($AppConfig.userObject);
			UserRepository.cacheUser(user1);

			occupants = [];
			occupants.push($AppConfig.username);
			occupants.push('windowUser');

			roomInfo = createRoomInfo('tag:ntiidd-1', occupants);

			chatWindow = Ext.create('NextThought.view.chat.Window',{
				renderTo: testBody,
				afterRender: Ext.emptyFn,
				initComponent: Ext.emptyFn,
				roomInfo: roomInfo
			});

			logView =  { addStatusNotification: Ext.emptyFn, clearChatStatusNotifications: Ext.emptyFn };
			chatView = { enable: Ext.emptyFn, disable: Ext.emptyFn };
			list = { updateList: Ext.emptyFn };

			spyOn(chatWindow, 'down').andCallFake(mockDown);
			spyOn(chatWindow, 'query').andReturn(null);
			spyOn(chatWindow, 'updateDisplayState');
			spyOn(chatWindow, 'setTitleInfo');

			spyOn(logView, 'addStatusNotification');
			spyOn(chatView, 'enable');
			spyOn(chatView, 'disable');
			spyOn(list, 'updateList');
		});

		it('User starts out online', function(){
			//set the presence info
			store.setPresenceOf($AppConfig.username, NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username,'available'));
			store.setPresenceOf('windowUser', NextThought.model.PresenceInfo.createPresenceInfo('windowUser', 'available'));

			chatWindow.roomInfoChanged(roomInfo);

			expect(chatWindow.onlineOccupants).toEqual([$AppConfig.username, 'windowUser']);
			expect(chatWindow.updateDisplayState).not.toHaveBeenCalled();
			expect(chatView.disable).not.toHaveBeenCalled();
			expect(chatView.enable).toHaveBeenCalledWith();
			expect(chatWindow.setTitleInfo).toHaveBeenCalledWith(users);
			expect(list.updateList).toHaveBeenCalledWith(users);
		});

		it('User starts out offline', function(){
			store.setPresenceOf($AppConfig.username, NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username,'available'));
			store.setPresenceOf('windowUser', NextThought.model.PresenceInfo.createPresenceInfo('windowUser', 'unavailable'));

			chatWindow.roomInfoChanged(roomInfo);

			expect(chatWindow.onlineOccupants).toEqual([$AppConfig.username]);
			expect(chatWindow.updateDisplayState).toHaveBeenCalled();
			expect(chatView.disable).toHaveBeenCalled();
			expect(chatView.enable).not.toHaveBeenCalledWith();
			expect(chatWindow.setTitleInfo).toHaveBeenCalled();
			expect(list.updateList).toHaveBeenCalled();
		});

		describe('Presence Change tests', function(){
			beforeEach(function(){
				store.setPresenceOf($AppConfig.username, NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username,'available'));
				store.setPresenceOf('windowUser', NextThought.model.PresenceInfo.createPresenceInfo('windowUser', 'available'));

				chatWindow.roomInfoChanged(roomInfo);
			});

			it('User isnt an occupant', function(){
				//presence change of user not in the chat
				var presence = NextThought.model.PresenceInfo.createPresenceInfo('nonExistant','unavailable');
				store.setPresenceOf('nonExistant', presence);
				chatWindow.presenceChanged('nonExistant', presence);

				expect(chatWindow.onlineOccupants).toEqual([$AppConfig.username, 'windowUser']);
				expect(chatWindow.updateDisplayState).not.toHaveBeenCalled();
				expect(chatView.disable).not.toHaveBeenCalled();
				expect(chatView.enable.calls[1]).toBeFalsy();//these were called in roomInfoChanged
				expect(chatWindow.setTitleInfo.calls[1]).toBeFalsy();
				expect(list.updateList.calls[1]).toBeFalsy();
			});

			it('User is the current user', function(){
				var presence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username, 'unavailable');
				store.setPresenceOf($AppConfig.username, presence);
				chatWindow.presenceChanged($AppConfig.username,presence)

				expect(chatWindow.onlineOccupants).toEqual([$AppConfig.username, 'windowUser']);
				expect(chatWindow.updateDisplayState).not.toHaveBeenCalled();
				expect(chatView.disable).not.toHaveBeenCalled();
				expect(chatView.enable.calls[1]).toBeFalsy();
				expect(chatWindow.setTitleInfo.calls[1]).toBeFalsy();
				expect(list.updateList.calls[1]).toBeFalsy();
			});

			it('User is an occupant, unavailable', function(){
				//presence change of user in the chat
				var presence = NextThought.model.PresenceInfo.createPresenceInfo('windowUser', 'unavailable');
				store.setPresenceOf('windowUser', presence);
				chatWindow.presenceChanged('windowUser', presence);

				expect(chatWindow.onlineOccupants).toEqual([$AppConfig.username]);
				expect(chatWindow.updateDisplayState).toHaveBeenCalled();
				expect(chatView.disable).toHaveBeenCalled();
				expect(chatView.enable.calls[1]).toBeFalsy();
				expect(chatWindow.setTitleInfo.calls[1]).toBeFalsy();
				expect(list.updateList.calls[1]).toBeFalsy();
			});

			it('User is an occupant, comes back online', function(){
				var online = NextThought.model.PresenceInfo.createPresenceInfo('windowUser', 'available'),
					offline = NextThought.model.PresenceInfo.createPresenceInfo('windowUser', 'unavailable');

				store.setPresenceOf('windowUser', online);
				chatWindow.presenceChanged('windowUser', offline);
				chatWindow.presenceChanged('windowUser', online);

				expect(chatWindow.onlineOccupants).toEqual([$AppConfig.username, 'windowUser']);
				expect(chatWindow.updateDisplayState).toHaveBeenCalled();
				expect(chatView.disable.calls[1]).toBeFalsy();
				expect(chatView.enable).toHaveBeenCalled();
				expect(chatWindow.setTitleInfo.calls[1]).toBeFalsy();
				expect(list.updateList.calls[1]).toBeFalsy();
			});
		});
	});

	describe("Group Chat", function(){
		var chatWindow, roomInfo, occupants, users;


		beforeEach(function(){
			//cache users
			var user1 = createUser('windowUser1'),
				user2 = createUser('windowUser2');

			users = [];
			users.push($AppConfig.userObject);
			users.push(user1);
			users.push(user2);
			UserRepository.cacheUser($AppConfig.userObject);
			UserRepository.cacheUser(user1);
			UserRepository.cacheUser(user2);

			occupants = [];
			occupants.push($AppConfig.username);
			occupants.push('windowUser1');
			occupants.push('windowUser2')

			roomInfo = createRoomInfo('tag:ntiidd-1', occupants);

			chatWindow = Ext.create('NextThought.view.chat.Window',{
				renderTo: testBody,
				afterRender: Ext.emptyFn,
				initComponent: Ext.emptyFn,
				roomInfo: roomInfo
			});

			logView =  { addStatusNotification: Ext.emptyFn, clearChatStatusNotifications: Ext.emptyFn };
			chatView = { enable: Ext.emptyFn, disable: Ext.emptyFn };
			list = { updateList: Ext.emptyFn };

			spyOn(chatWindow, 'down').andCallFake(mockDown);
			spyOn(chatWindow, 'query').andReturn(null);
			spyOn(chatWindow, 'updateDisplayState');
			spyOn(chatWindow, 'setTitleInfo');

			spyOn(logView, 'addStatusNotification');
			spyOn(chatView, 'enable');
			spyOn(chatView, 'disable');
			spyOn(list, 'updateList');
		});

		it("Both users online", function(){
			//set the presence info
			store.setPresenceOf($AppConfig.username, NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username,'available'));
			store.setPresenceOf('windowUser1', NextThought.model.PresenceInfo.createPresenceInfo('windowUser1', 'available'));
			store.setPresenceOf('windowUser2', NextThought.model.PresenceInfo.createPresenceInfo('windowUser2', 'available'));

			chatWindow.roomInfoChanged(roomInfo);

			expect(chatWindow.onlineOccupants).toEqual([$AppConfig.username, 'windowUser1', 'windowUser2']);
			expect(chatWindow.updateDisplayState).not.toHaveBeenCalled();
			expect(chatView.disable).not.toHaveBeenCalled();
			expect(chatView.enable).toHaveBeenCalledWith();
			expect(chatWindow.setTitleInfo).toHaveBeenCalledWith(users);
			expect(list.updateList).toHaveBeenCalledWith(users);
		});

		it("Only one user online", function(){
			store.setPresenceOf($AppConfig.username, NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username,'available'));
			store.setPresenceOf('windowUser1', NextThought.model.PresenceInfo.createPresenceInfo('windowUser1', 'available'));
			store.setPresenceOf('windowUser2', NextThought.model.PresenceInfo.createPresenceInfo('windowUser2', 'unavailable'));

			chatWindow.roomInfoChanged(roomInfo);

			expect(chatWindow.onlineOccupants).toEqual([$AppConfig.username, 'windowUser1']);
			expect(chatWindow.updateDisplayState).toHaveBeenCalled();
			expect(chatView.disable).not.toHaveBeenCalled();
			expect(chatView.enable).toHaveBeenCalledWith();
			expect(chatWindow.setTitleInfo).toHaveBeenCalledWith(users);
			expect(list.updateList).toHaveBeenCalledWith(users);
		});

		it("Neither user online", function(){
			store.setPresenceOf($AppConfig.username, NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username,'available'));
			store.setPresenceOf('windowUser1', NextThought.model.PresenceInfo.createPresenceInfo('windowUser1', 'unavailable'));
			store.setPresenceOf('windowUser2', NextThought.model.PresenceInfo.createPresenceInfo('windowUser2', 'unavailable'));

			chatWindow.roomInfoChanged(roomInfo);

			expect(chatWindow.onlineOccupants).toEqual([$AppConfig.username]);
			expect(chatWindow.updateDisplayState).toHaveBeenCalled();
			expect(chatView.disable).toHaveBeenCalled();
			expect(chatView.enable).not.toHaveBeenCalledWith();
			expect(chatWindow.setTitleInfo).toHaveBeenCalled();
			expect(list.updateList).toHaveBeenCalled();
		});
	});
});
describe('Chat Controller Tests', function(){

	var controller, socket, oldUserRepo;

	beforeEach(function(){
		var userRepo = NTITestUtils.newInstanceOfSingleton(UserRepository);

		//Swizzle out the global UserRepository so we don't pollute global state
		//would be nice to get things like this at a higher level so we don't have
		//to be careful about it in every test.  Also we are assuming the contents of
		//this spec run together at once
		oldUserRepo = UserRepository;
		UserRepository = userRepo;
		precacheUsers(userRepo);

		socket = NextThought.proxy.Socket.self.create(); //May need support for one more level deep (socket.io objects so we can fire emits)
		controller = NextThought.controller.Chat.create({
			socket: socket,
			models: [],
			views: [],
			refs: []
		});

		//init usually gets called automatically when the app is setting up controllers
		//do that here
		controller.application = app;
		controller.init(app);
	});

	afterEach(function(){
		UserRepository = oldUserRepo;
	});

	function precacheUsers(repo){

		function userForName(name){
			return new NextThought.model.User({Username: name});
		}

		//Note we don't use precacheUser here
		//bercause that does some special handling if
		//the user is the AppUser.  I think that ends up
		//polluting some global state
		repo.cacheUser($AppConfig.userObject);
		repo.cacheUser(userForName('user2'));
		repo.cacheUser(userForName('user1'));
	};

	it('Is not using the global UserRepo for tests', function(){
		expect(UserRepository).toBeTruthy();
		expect(UserRepository).not.toBe(oldUserRepo);
	});

	it('Listens for several socket events', function(){
		var expectedEvents = ['disconnect', 'serverkill', 'chat_enteredRoom', 'chat_exitedRoom',
							  'chat_roomMembershipChanged', 'chat_setPresenceOfUsersTo',
							  'chat_recvMessage', 'chat_recvMessageForShadow'];

		Ext.each(expectedEvents, function(e){
			expect(Ext.isFunction(socket.control[e])).toBeTruthy();
		});
	});

	describe('Exit room tests', function(){
		function createRoomWithOccupants( cid, occupants){
			return NextThought.model.RoomInfo.create({'Occupants': occupants, 'id': cid});
		}

		function createChatWindowWithRoom(room){
			return Ext.widget('chat-window', {roomInfo: room});
		}

		var oldRoom, win, currentUser, list;
		beforeEach(function(){
			currentUser = $AppConfig.username;
			list = [ currentUser, 'user2'];
			oldRoom = createRoomWithOccupants('tag:ntiidd-1', list);
			win = createChatWindowWithRoom(oldRoom);
			//Overrides
			controller.getRoomInfoFromSession = function(id){ return oldRoom; };
			controller.getChatWindow = function(cid){ return win; };
		});

		afterEach(function(){
			win.close();
		});

		it("checks if we disable the input field when only one user is left in the chat", function(){
			var	changedMessage = {'ID': 'tag:ntiidd-1', 'Occupants': [currentUser], 'Class': "RoomInfo", 'NTIID': 'tag:ntiidd-1'};

			expect(win.roomInfo.get('Occupants')).toEqual([currentUser, 'user2']);
			expect( win.down('chat-entry').isDisabled()).toBeFalsy();

			//Now let's assume user2 exits the chat and we get 'chat_roomMembershipChanged' socket event
			controller.onMembershipOrModerationChanged(changedMessage);

			expect(win.roomInfo.get('Occupants')).toEqual([currentUser]);
			expect( win.down('chat-entry').isDisabled()).toBeTruthy();

		});

		it('checks if when room changes, the list of original occupants stay the same', function(){
			var	changedMessage = {'ID': 'tag:ntiidd-1', 'Occupants': [currentUser], 'Class': "RoomInfo", 'NTIID': 'tag:ntiidd-1'};

			//Assume we set the original Occupants list( it usually gets sets when a user enters a room.
			win.roomInfo.setOriginalOccupants(list.slice());

			expect( win.roomInfo.getOriginalOccupants()).toEqual(list);
			expect( win.roomInfo.get('Occupants')).toEqual([currentUser, 'user2']);

			//Now let's assume user2 exits the chat and we change the roomInfo.
			controller.onMembershipOrModerationChanged(changedMessage);

			expect( win.roomInfo.getOriginalOccupants()).toEqual(list);
			expect( win.roomInfo.get('Occupants')).toEqual([currentUser]);

		});
	});

	describe('Chat state Tests', function(){

		describe('Publish state Test', function(){

			function createRoomWithStatus(username, state){
				var room = NextThought.model.RoomInfo.create();
				room.setRoomState(username, state);
				return room;
			}

			it('Does not publish duplicate states', function(){
				var room = createRoomWithStatus('user1', 'composing');

				spyOn(controller, 'postMessage');

				controller.publishChatStatus(room, 'composing', 'user1');

				expect(controller.postMessage).not.toHaveBeenCalled();
			});

			it('Publishing new state calls post with correct data', function(){
				var room = createRoomWithStatus('user1', 'composing'),
					args, statePayload;
				spyOn(controller, 'postMessage');

				controller.publishChatStatus(room, 'paused', 'user1');

				expect(controller.postMessage).toHaveBeenCalled();
				expect(controller.postMessage.calls.length).toEqual(1);

				args = controller.postMessage.calls[0].args;

				expect(args[0]).toBe(room);

				statePayload = args[1];
				expect(statePayload.state).toEqual('paused');

				expect(args[2]).toBeFalsy();
				expect(args[3]).toBe('STATE');
			});

		});

		describe('OnMessage Tests', function(){
			function createMessage( containerId, channel, user, body){
				return { 'ContainerId': containerId, 'Creator': user, 'channel': channel, Class: "MessageInfo", body: body || '' };
			}

			var room, win;
			beforeEach( function(){
				room = NextThought.model.RoomInfo.create();
				win = Ext.widget('chat-window', {roomInfo: room});
				//set channel map
				controller.setChannelMap();
				//Override this method for the purpose of this test.
				controller.getChatWindow = function(cid){
					return win;
				};
			});

			afterEach(function(){
				win.close();
			});

			it("Checks if we change state to 'active' when a user receive his own message", function(){
				var user ='user1', msg = createMessage('ntiid-1', 'DEFAULT', user, ['Hey!']);
				spyOn(controller, 'updateChatState').andCallThrough();

				//Arbitrary set room to composing
				room.setRoomState(user, 'composing');
				expect(room.getRoomState(user)).toEqual('composing');
				controller.onMessage(msg);
				expect(controller.updateChatState).toHaveBeenCalledWith(user, 'active', win, false);
				expect(room.getRoomState(user)).toEqual('active');
			});

			it('Checks if we call the appropriate method based on channel type', function(){
				var msg = createMessage('ntiid-1', 'STATE', 'user1', {state:'paused'});
				spyOn(controller, 'onReceiveStateChannel').andCallThrough();
				spyOn(controller, 'onMessageDefaultChannel').andCallThrough();
				spyOn(controller, 'updateChatState').andCallThrough();

				controller.onMessage(msg);

				expect(controller.updateChatState).toHaveBeenCalledWith('user1', 'paused', win, false);
				expect(controller.onMessageDefaultChannel).not.toHaveBeenCalled();
				//FIXME: it fails, because we call the body of the method not the name of the method.
//				expect(controller.onReceiveStateChannel).toHaveBeenCalled();
			});
		});
	});
	
	describe('linkClicked tests',function(){
		it('Passing external',function(){
			var link = 'www.google.com',
				result = controller.getHashChange(link,"www.facebook.com");

			expect(result).toBeNull();
		});

		it('Passing internal',function(){
			var link = 'www.google.com/#!hash';
				result = controller.getHashChange(link,"www.google.com");

			expect(result).toBe('!hash');
		});
	});

	describe('PresenceInfo tests',function(){
		var userNames, presenceObjects;
		beforeEach(function(){
			var i;
			userNames = ['firstName','secondName','thirdName'];
			presenceObjects = {};

			for(i = 0; i < userNames.length; i++){
				presenceObjects[userNames[i]] = {
					'Class' : 'PresenceInfo',
					'username' : userNames[i],
					'type' : 'available',
					'show' : 'chat',
					'status' : ''
				};
			}

			spyOn(socket,'emit');
		});

		it("chat_setPresence is emitted in onSessionReady", function(){
			controller.onSessionReady();

			expect(socket.emit).toHaveBeenCalledWith('chat_setPresence',jasmine.any(Object),jasmine.any(Function));
		});

		describe('test maybeHandleChatEvents', function(){

			beforeEach(function(){
				controller.mockChatEventHandler = Ext.emptyFn;

				spyOn(controller,'mockChatEventHandler');
			});

			afterEach(function(){
				delete controller.mockChatEventHandler;
				controller.availableForChat = false;
			});

			it('availableForChat is false',function(){
				var fn;

				controller.availableForChat = false;

				fn = controller.createHandlerForChatEvents(controller.mockChatEventHandler,'mock event');

				fn.apply(controller);

				expect(controller.mockChatEventHandler).not.toHaveBeenCalled();
			});

			it('availableForChat is true',function(){
				var fn;

				controller.availableForChat = true;

				fn = controller.createHandlerForChatEvents(controller.mockChatEventHandler,'mock event');

				fn.apply(controller);

				expect(controller.mockChatEventHandler).toHaveBeenCalled();
			});
		});

		describe('handleSetPresence', function(){

			function checkSetPresence(){
				var i, presence,
					store = controller.getPresenceInfoStore();

				controller.handleSetPresence(presenceObjects);

				for(i = 0; i < userNames.length; i++){
					presence = store.getPresenceOf(userNames[i])
					expect(presence.get('username')).toBe(userNames[i]);
					expect(presence.get('type')).toBe('available');
				}
			}

			it('Passing key value json without the current user',checkSetPresence);

			it('Passing key value json with the current user',function(){
				var current = $AppConfig.userObject

				presenceObjects[current.get('Username')] = {
					'Class' : 'PresenceInfo',
					'username' : current.get('username'),
					'type' : 'available',
					'show' : 'chat',
					'status' : ''
				}

				checkSetPresence();
				expect(controller.availableForChat).toBeTruthy();
				controller.availableForChat = false;

				delete presenceObjects[current.get('Username')];
			});
		});

		describe("changePresence Tests",function(){

			it("Passing just a type", function(){
				var model = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username,'unavailable');

				controller.changePresence('unavailable');

				expect(socket.emit).toHaveBeenCalledWith('chat_setPresence',model.asJSON(), jasmine.any(Function));
			});

		});

		describe("change presence event handler tests", function(){
			beforeEach(function(){
				spyOn(controller,'changePresence').andCallThrough();
			});

			it("set-chat-type test", function(){
				var show = $AppConfig.userObject.get('Presence').get('show'),
					status = $AppConfig.userObject.get('Presence').get('status'),
					presence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username,'unavailable',show,status);

				controller.changeType("unavailable");
				expect(controller.changePresence).toHaveBeenCalledWith('unavailable', show, status);//the default values for show and status
				expect(socket.emit).toHaveBeenCalledWith("chat_setPresence", presence.asJSON(), jasmine.any(Function));
			});

			it("set-chat-show test", function(){
				var status = $AppConfig.userObject.get('Presence').get('status'),
					presence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username, 'available','chat',status);

				controller.changeShow("chat");
				expect(controller.changePresence).toHaveBeenCalledWith("available","chat",status);
				expect(socket.emit).toHaveBeenCalledWith("chat_setPresence", presence.asJSON(), jasmine.any(Function));
			});

			it("set-chat-status test", function(){
				var show = $AppConfig.userObject.get('Presence').get('show'),
					type = $AppConfig.userObject.get('Presence').get('type'),
					presence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username,type,show,"New Status");

				controller.changeStatus("New Status");
				expect(controller.changePresence).toHaveBeenCalledWith('unavailable', show, status);//the default values for show and status
				expect(socket.emit).toHaveBeenCalledWith("chat_setPresence", presence.asJSON(), jasmine.any(Function));
			});
		});
	});

	
});


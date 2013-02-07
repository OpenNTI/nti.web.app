describe('Chat Controller Tests', function(){

	var controller;
	beforeEach(function(){
		controller = NextThought.controller.Chat.create({
			models: [],
			views: [],
			refs: []
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
});


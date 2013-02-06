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
	});
});


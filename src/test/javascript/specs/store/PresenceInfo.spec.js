describe('Presence store',function(){
	var userObjects, userNames, presenceObjects, presenceStore;
	beforeEach(function(){
		var i;
		userObjects = new Array();
		presenceObjects = new Array();
		userNames = [ 'firstName', 'secondName', 'thirdName'];
		presenceStore = Ext.create('NextThought.store.PresenceInfo');

		for(i = 0; i < userNames.length; i++){
			userObjects[i] = Ext.create('NextThought.model.User',{ 'Username': userNames[i]});
			presenceObjects[i] = Ext.create('NextThought.model.PresenceInfo',{
				'Username' : userNames[i],
				'type' : 'available',
				'show' : 'chat',
				'status' : ''
			});
			presenceStore.add(presenceObjects[i]);
		}
	});

	describe('getPresenceOf',function(){
		it('Passing Usernames', function(){
			var i, result;

			for(i = 0; i < userNames.length; i++){
				result = presenceStore.getPresenceOf(userNames[i]);

				expect(result).toBe(presenceObjects[i]);
			}
		});

		it('Passing UserObjects', function(){
			var i, result;

			for(i = 0; i < userNames.length; i++){
				result = presenceStore.getPresenceOf(userObjects[i]);

				expect(result).toBe(presenceObjects[i]);
			}
		});
	});

	describe('setPresenceOf',function(){
		describe('User alread exists',function(){
			it('Passing userNames',function(){
				var obj = {
					'Class' : 'PresenceInfo',
					'Username' :  userNames[0],
					'type' : 'unavailable',
					'show' : 'chat',
					'status' : ''
				};


				presenceStore.setPresenceOf(userNames[0],ParseUtils.parseItems([obj])[0]);
				expect(presenceObjects[0].get('type')).toEqual('unavailable');
			});
			
			it('Passing user objects',function(){
				var obj = {
					'Class' : 'PresenceInfo',
					'Username' :  userNames[0],
					'type' : 'unavailable',
					'show' : 'chat',
					'status' : ''
				};

				presenceStore.setPresenceOf(userObjects[0],ParseUtils.parseItems([obj])[0]);
				expect(presenceObjects[0].get('type')).toEqual('unavailable');
			});
		});

		it('User doesnt exist',function(){
			var result, obj = {
				'Class' : 'PresenceInfo',
				'Username' : 'newName',
				'type' : 'available',
				'show' : 'chat',
				'status' : ''
			};

			presenceStore.setPresenceOf(obj.Username,ParseUtils.parseItems([obj])[0]);
			result = presenceStore.getPresenceOf(obj.Username);

			expect(result.get('Username')).toBe(obj.Username);
			expect(result.get('type')).toBe(obj.type);
		});
	});
});
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
				'username' : userNames[i],
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
		
		beforeEach(function(){
			spyOn(presenceStore,"fireEvent");
		});

		it('User alread exists',function(){
			var obj = {
					'Class' : 'PresenceInfo',
					'Username' :  userNames[0],
					'type' : 'unavailable',
					'show' : 'chat',
					'status' : ''
				},
				model = ParseUtils.parseItems([obj])[0];


			presenceStore.setPresenceOf(userNames[0],model);
			expect(presenceObjects[0].get('type')).toEqual('unavailable');
			expect(presenceStore.fireEvent).toHaveBeenCalledWith('presence-changed',userNames[0],model)
		});

		it('User doesnt exist',function(){
			var result, obj = {
					'Class' : 'PresenceInfo',
					'username' : 'newName',
					'type' : 'available',
					'show' : 'chat',
					'status' : ''
				}, 
				model = ParseUtils.parseItems([obj])[0];

			presenceStore.setPresenceOf(obj.username,model);
			result = presenceStore.getPresenceOf(obj.username);

			expect(result.get('username')).toBe(obj.username);
			expect(result.get('type')).toBe(obj.type);
			expect(presenceStore.fireEvent).toHaveBeenCalledWith('presence-changed',obj.username,model);
		});
	});
});
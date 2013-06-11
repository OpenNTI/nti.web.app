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
			presenceObjects[i] =  NextThought.model.PresenceInfo.createPresenceInfo(userNames[i],'available');
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
			var model = NextThought.model.PresenceInfo.createPresenceInfo(userNames[0],'unavailable');


			presenceStore.setPresenceOf(userNames[0],model);
			expect(presenceObjects[0].get('type')).toEqual('unavailable');
			expect(presenceStore.fireEvent).toHaveBeenCalledWith('presence-changed',userNames[0],model)
		});

		it('User doesnt exist',function(){
			var result, model = NextThought.model.PresenceInfo.createPresenceInfo('newName','available');

			presenceStore.setPresenceOf('newName',model);
			result = presenceStore.getPresenceOf('newName');

			expect(result.get('username')).toBe('newName');
			expect(result.get('type')).toBe('available');
			expect(presenceStore.fireEvent).toHaveBeenCalledWith('presence-changed','newName',model);
		});
	});
});
describe("PresenceInfo Model",function(){
	
	it('createPresence only username and type', function(){
		var model = NextThought.model.PresenceInfo.createPresenceInfo('username','available');

		expect(model.get('username')).toBe('username');
		expect(model.get('type')).toBe('available');
		expect(model.get('show')).toBe('chat');
		expect(model.get('status')).toBeNull();
	});

	it('createPresence passing everything', function(){
		var model = NextThought.model.PresenceInfo.createPresenceInfo('username','available','show','status');

		expect(model.get('username')).toBe('username');
		expect(model.get('type')).toBe('available');
		expect(model.get('show')).toBe('show');
		expect(model.get('status')).toBe('status');
	});

	it('isOnline and toString',function(){
		var online = NextThought.model.PresenceInfo.createPresenceInfo('online','available'),
			offline = NextThought.model.PresenceInfo.createPresenceInfo('offline','unavailable');

		expect(online.isOnline()).toBeTruthy();
		expect(online.toString()).toBe('Online');

		expect(offline.isOnline()).toBeFalsy();
		expect(offline.toString()).toBe('Offline');
	});
});
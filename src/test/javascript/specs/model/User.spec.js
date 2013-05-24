describe("User Tests", function() {

	function createUser(alias, realname, username){
		var user = Ext.create('NextThought.model.User', {
			alias: alias,
			realname: realname,
			Username: username
		});
		return user;
	}

	describe('getName is correct', function(){

		it('Prefers alias', function(){
			var user = createUser('a', 'b', 'c');
			expect(user.getName()).toEqual('a');
		});

		it('Falls back to realname if no alias', function(){
			var user = createUser(null, 'b', 'c');
			expect(user.getName()).toEqual('b');
		});

		it('Falls back to username if nothing else', function(){
			var user = createUser(null, null, 'c');
			expect(user.getName()).toEqual('c');
		});

	});

	describe('isUnresolved works', function(){
		it('Returns true for unresolved users', function(){
			var u = NextThought.model.User.getUnresolved('foobar');
			expect(u.isUnresolved()).toBeTruthy();
		});

		it('Returns false for resolved users', function(){
			var u = createUser('a', 'b', 'c');
			expect(u.isUnresolved()).toBeFalsy();
		});
	});

	it('doesn\'t change null fields to empty string', function(){
		var user = Ext.create('NextThought.model.User', {
			home_page: null,
			Username: 'user1'
		}), json;

		expect(user.get('home_page')).toBe(null);
		json = user.asJSON();

		expect(user.home_page).toBeFalsy();
		expect(user.home_page).not.toBe('');
	});

	it('Presence tests', function(){
		var online = Ext.create('NextThought.model.User',{
			Username: 'online',
			Presence: NextThought.model.PresenceInfo.createPresenceInfo('online','available')
		}), offline = Ext.create('NextThought.model.User',{
			Username: 'offline',
			Presence: NextThought.model.PresenceInfo.createPresenceInfo('offline','unavailable')
		}), onlinePresence = online.getPresence(),
			offlinePresence = offline.getPresence();

		expect(onlinePresence.get('username')).toBe('online');
		expect(onlinePresence.isOnline()).toBeTruthy();
		expect(offlinePresence.get('username')).toBe('offline');
		expect(offlinePresence.isOnline()).toBeFalsy();
	})
});

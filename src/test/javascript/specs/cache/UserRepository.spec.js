describe("User Repository/Store/Cache Behavior", function(){
	var TUR;

	beforeEach(function(){
		TUR = {};
		/*jslint sub:true */ //no way to ignore reserved property if using don notation
		TUR['__proto__'] = NextThought.cache.UserRepository['__proto__'];
	});


	function createUser(username, additional){
		var cfg = Ext.applyIf(additional || {}, {
			'Username': username
		});

		return new NextThought.model.User(cfg);
	}


	it('Defines UserRepository', function(){
		expect(UserRepository).toBeTruthy();
	});

	it('Owns a store', function(){
		var s;
		expect(TUR.store).toBeFalsy();

		s = TUR.getStore();
		expect(s).toBeTruthy();

		expect(TUR.getStore()).toBe(s);
	});

	describe('Presence handling', function(){
		var hans;

		beforeEach(function(){
			hans = createUser('hans', {Presence: 'Online'});
			spyOn(hans, 'fireEvent');

			TUR.cacheUser(hans);
		});

		it('Updates hans', function(){
			TUR.presenceChanged('hans', 'Online');

			expect(hans.fireEvent.calls.length).toBe(1);
			expect(hans.fireEvent).toHaveBeenCalledWith('changed', hans);

			expect(hans.get('Presence')).toBe('Online');
		});

		it('Survives missing user', function(){
			TUR.presenceChanged('bruce', 'away');

			expect(hans.fireEvent).not.toHaveBeenCalled();
			expect(hans.get('Presence')).toBe('Online');
		})
	});

});

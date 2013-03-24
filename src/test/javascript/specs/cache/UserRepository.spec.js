describe("User Repository/Store/Cache Behavior", function(){
	var TUR;

	beforeEach(function(){
		TUR = {};
		/*jslint sub:true */ //no way to ignore reserved property if using don notation
		TUR['__proto__'] = NextThought.cache.UserRepository['__proto__'];
		TUR.constructor();
		console.log('Creating a new user repository');
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
		expect(TUR.store).toBeNull();

		s = TUR.getStore();
		expect(s).toBeTruthy();

		expect(TUR.getStore()).toBe(s);
	});

	describe('Presence handling', function(){
		var hans;

		beforeEach(function(){
			hans = createUser('hans', {Presence: 'Offline'});
			spyOn(hans, 'fireEvent');

			TUR.cacheUser(hans);
		});

		afterEach(function(){
			TUR.getStore().remove(hans);
		});

		it('Updates hans', function(){
			TUR.presenceChanged('hans', 'Online');

			expect(hans.fireEvent).toHaveBeenCalledWith('changed', hans);

			expect(hans.get('Presence')).toBe('Online');
		});

		it('Survives missing user', function(){
			TUR.presenceChanged('bruce', 'away');

			expect(hans.fireEvent).not.toHaveBeenCalled();
			expect(hans.get('Presence')).toBe('Offline');
		})
	});

	describe('resolveFromStore', function(){

		var hans, terrorists;

		beforeEach(function(){
			hans = createUser('hans');
			terrorists = new NextThought.model.FriendsList({Username: 'terrorists', NTIID: 'foobar'});

			TUR.cacheUser(hans);
			TUR.cacheUser(terrorists);
		});

		afterEach(function(){
			TUR.getStore().remove(hans);
			TUR.getStore().remove(terrorists);
		});

		it('Finds things whose id property is username', function(){
			expect(hans.idProperty).toEqual('Username');
			expect(TUR.resolveFromStore(hans.getId())).toBe(hans);
		});

		it('Also finds things whose id property is NTIID', function(){
			expect(terrorists.idProperty).toEqual('NTIID');
			expect(TUR.resolveFromStore(terrorists.getId())).toBe(terrorists);
		});
	});

	describe('cacheUser', function(){

		var hans, terrorists;

		beforeEach(function(){
			hans = createUser('hans', {alias: 'hans'});
			spyOn(hans, 'fireEvent');
			TUR.cacheUser(hans);
		});

		afterEach(function(){
			TUR.getStore().remove(hans);
		});

		it('adds new users', function(){
			expect(TUR.resolveFromStore('hans')).toBe(hans);
		});

		it('clobers existing users if not asked to merge', function(){
			var hansTwin = createUser('hans');
			TUR.cacheUser(hansTwin);

			expect(TUR.resolveFromStore('hans')).not.toBe(hans);
			expect(TUR.resolveFromStore('hans')).toBe(hansTwin);
		});

		it('merges users when asked', function(){
			var hansTwin = createUser('hans', {alias: 'new hans'});
			TUR.cacheUser(hansTwin, true);

			expect(TUR.resolveFromStore('hans')).toBe(hans);
			expect(hans.fireEvent).toHaveBeenCalledWith('changed', hans);
			expect(hans.get('alias')).toEqual('new hans');
		});
	});

	describe('getUser', function(){
		describe('Callsback with what it receives', function(){
			it('Gives a single object if asked for one', function(){

			});

			it('Gives an array if asked for one', function(){

			});
		});

		describe('Will take many tupes of input', function(){
			it('handles a string', function(){

			});

			it('handles a model', function(){

			});

			it('handles a json string', function(){

			});
		});

		describe('Resolves users remotely at the right time', function(){
			it('Will return summary objects unless asked not to', function(){

			});

			it('Allways preferes non summary objects', function(){

			});

			it('Will refresh a summary object if asked', function(){

			});

			it('Will return placeholders if resolution fails', function(){

			});

			it('Handles a mix of these cases appropriately', function(){

			});
		});
	});

	describe('makeRequest', function(){

		var mockAjax, realAjax;

		beforeEach(function(){
			realAjax = Ext.Ajax;
			mockAjax = {
				request: function(cfg){
					var r = {};
					r.options = {callback: cfg.callback, scope: cfg.scope};
					r.finish = function(object){
						var cb = this.options.callback,
							resp = {};

						resp.responseText = JSON.stringify(object);
						Ext.callback(cb, this.options.scope, [{}, true, resp]);
					}
					r.fail = function(){
						var cb = this.options.callback;
						Ext.callback(cb, this.options.scope, [{}, false, null]);
					}
					return r;
				}
			};

			Ext.Ajax = mockAjax;

			spyOn(mockAjax, 'request').andCallThrough();
		});

		afterEach(function(){
			Ext.Ajax = realAjax;
		});

		function setupRequest(user){
			var callbacks = jasmine.createSpyObj('callbacks', ['failure', 'success']),
				req;
			TUR.makeRequest('harry', callbacks);

			expect(mockAjax.request).toHaveBeenCalled();

			req = TUR.activeRequests['harry'];

			expect(req).toBeTruthy();

			return {request: req, callbacks: callbacks};
		}

		function responseForItems(items){
			if(!Ext.isArray(items)){
				items = [items];
			}

			items = Ext.Array.map(items, function(i){
				return i.data || i;
			});

			return {Items: items};
		}

		it('Failure callback will be called', function(){
			var req = setupRequest('harry');
			req.request.fail();

			expect(req.callbacks.failure).toHaveBeenCalled();
			expect(req.callbacks.success).not.toHaveBeenCalled();
			expect(TUR.activeRequests['harry']).toBeUndefined();
		});

		it('Calls failure callback if user doesnt resolve', function(){
			var req = setupRequest('harry');
			req.request.finish(responseForItems([]));

			expect(req.callbacks.failure).toHaveBeenCalled();
			expect(req.callbacks.success).not.toHaveBeenCalled();
			expect(TUR.activeRequests['harry']).toBeUndefined();
		});

		it('Returns non summary object', function(){
			var r = setupRequest('harry'),
				user = createUser('harry'),
				scb = r.callbacks.success,
				result;

			expect(user.summaryObject).toBeTruthy();

			r.request.finish(responseForItems(user));

			expect(r.callbacks.failure).not.toHaveBeenCalled();
			expect(scb).toHaveBeenCalled();
			expect(TUR.activeRequests['harry']).toBeUndefined();

			result = scb.mostRecentCall.args[0];
			expect(result.get('Username')).toBe('harry');
			expect(result.summaryObject).toBeFalsy();

		});

		it('Gracefully handles multiple users being returned', function(){
			var r = setupRequest('harry'),
				user1 = createUser('harry'),
				user2 = createUser('harry'),
				scb = r.callbacks.success,
				result;


			r.request.finish(responseForItems([user1, user2]));

			expect(r.callbacks.failure).not.toHaveBeenCalled();
			expect(scb).toHaveBeenCalled();
			expect(TUR.activeRequests['harry']).toBeUndefined();

			result = scb.mostRecentCall.args[0];
			expect(result.get('Username')).toBe('harry');
		});

		it('Wont make requests if in flight', function(){
			var r = setupRequest('harry'),
				firstCbs = r.callbacks,
				user = createUser('harry'),
				scb = firstCbs.success,
				secondCbs = jasmine.createSpyObj('secondCbs', ['success', 'failure']),
				scbTwo = secondCbs.success;

			expect(mockAjax.request.calls.length).toBe(1);

			TUR.makeRequest('harry', secondCbs);

			expect(mockAjax.request.calls.length).toBe(1);

			r.request.finish(responseForItems(user));

			expect(firstCbs.failure).not.toHaveBeenCalled();
			expect(secondCbs.failure).not.toHaveBeenCalled();

			expect(scb).toHaveBeenCalled();
			expect(scbTwo).toHaveBeenCalled();

			expect(TUR.activeRequests['harry']).toBeUndefined();

			result = scb.mostRecentCall.args[0];
			expect(result.get('Username')).toBe('harry');
			expect(result.summaryObject).toBeFalsy();

			result = scbTwo.mostRecentCall.args[0];
			expect(result.get('Username')).toBe('harry');
			expect(result.summaryObject).toBeFalsy();
		});
	});

});

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

		return NextThought.model.User.create(cfg);
	}

	function createList(username){
		return NextThought.model.FriendsList.create({Username: username, NTIID: 'ntiid'+username});
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

			spyOn(TUR,'presenceChanged').andCallThrough();
		});

		afterEach(function(){
			TUR.getStore().remove(hans);
		});

		it('Updates hans', function(){
			TUR.presenceChanged('hans', 'Online');

			expect(hans.fireEvent).toHaveBeenCalledWith('changed', hans);

			expect(hans.get('Presence').isOnline()).toBeTruthy();
		});

		it('Survives missing user', function(){
			TUR.presenceChanged('bruce', 'away');

			expect(hans.fireEvent).not.toHaveBeenCalled();
			expect(hans.get('Presence').isOnline()).toBeFalsy();
		});

		it('presence-changed which gets handled by TUR',function(){
			var store = Ext.getStore('PresenceInfo'),
				online = NextThought.model.PresenceInfo.createPresenceInfo('hans','available');

			TUR.setPresenceChangeListener(store);
			store.setPresenceOf('hans',online);

			expect(TUR.presenceChanged).toHaveBeenCalled();
			expect(TUR.presenceChanged.mostRecentCall.args[0]).toBe('hans');
			expect(TUR.presenceChanged.mostRecentCall.args[1]).toBe(online);
			expect(hans.get('Presence').isOnline()).toBeTruthy();
		});
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

		function mockMakeRequest(repo, users){
			spyOn(repo, 'makeRequest').andCallFake(function(username, callbacks){
				var user = users[username],
					callback = user ? callbacks.success : callbacks.failure;

				if(user){
					user.summaryObject = false;
				}
				Ext.callback(callback, callbacks.scope, [user]);
			});
		};

		var scope = {}, hans, holly;

		beforeEach(function(){
			hans = createUser('hans');
			holly =  createUser('holly');
			mockMakeRequest(TUR, {
				'hans': hans,
				'holly': holly
			});
		});

		function createCallbackExpecting(expected, s){
			return function(users){
				var returnedUserNames;
				expect(this).toBe(s);
				if(Ext.isArray(expected)){
					expect(Ext.isArray(users)).toBeTruthy();
					returnedUserNames = Ext.Array.pluck(users, 'data');
					returnedUserNames = Ext.Array.pluck(returnedUserNames, 'Username');
					expect(returnedUserNames).toEqual(expected);
				}
				else{
					expect(users.isModel).toBeTruthy();
					expect(users.get('Username')).toBe('hans');
				}
			}
		}

		describe('Callsback with what it receives', function(){
			it('Gives a single object if asked for one', function(){
				TUR.getUser('hans', createCallbackExpecting('hans', scope), scope);
			});

			it('Gives an array if asked for one', function(){
				TUR.getUser(['hans', 'holly'], createCallbackExpecting(['hans', 'holly'], scope), scope);
			});
		});

		describe('Will take many tupes of input', function(){
			it('handles a string', function(){
				TUR.getUser('hans', createCallbackExpecting('hans', scope), scope);
			});

			it('handles a model', function(){
				TUR.getUser(hans, createCallbackExpecting('hans', scope), scope);
			});

			it('handles a json string', function(){
				var data = {Class: 'User', Username: 'hans'};
				TUR.getUser(data, createCallbackExpecting('hans', scope), scope);
			});
		});

		describe('Handles friendslists', function(){
			it('Gives back list for uname', function(){
				var fl = createList('foo');
				TUR.precacheUser(fl);

				TUR.getUser(['foo'], createCallbackExpecting([fl.get('Username')], scope), scope);
			});

			it('Gives back list for fl', function(){
				var fl = createList('foo');
				TUR.precacheUser(fl);

				TUR.getUser([fl], createCallbackExpecting([fl.get('Username')], scope), scope);
			});
		});

		describe('Resolves users remotely at the right time', function(){
			it('Will return summary objects unless asked not to', function(){
				TUR.cacheUser(hans);

				expect(hans.summaryObject).toBeTruthy();
				TUR.getUser('hans', function(users){
					expect(this).toBe(scope);
					expect(users).toBe(hans);
					expect(users.summaryObject).toBeTruthy();
				}, scope);

				expect(TUR.makeRequest).not.toHaveBeenCalled();
				TUR.getStore().remove(hans);
			});

			it('Allways preferes non summary objects', function(){
				hans.summaryObject = false;
				TUR.cacheUser(hans);

				expect(hans.summaryObject).toBeFalsy();
				TUR.getUser('hans', function(users){
					expect(this).toBe(scope);
					expect(users).toBe(hans);
					expect(users.summaryObject).toBeFalsy();
				}, scope);

				expect(TUR.makeRequest).not.toHaveBeenCalled();

				TUR.getStore().remove(hans);
			});

			it('Will refresh a summary object if asked', function(){
				TUR.cacheUser(hans);

				expect(hans.summaryObject).toBeTruthy();
				TUR.getUser('hans', function(users){
					expect(this).toBe(scope);
					expect(users).toBe(hans);
					expect(users.summaryObject).toBeFalsy();
				}, scope, true);

				expect(TUR.makeRequest).toHaveBeenCalledWith('hans', jasmine.any(Object), undefined);
				TUR.getStore().remove(hans);
			});

			it('Will return placeholders if resolution fails', function(){

				TUR.getUser('Igor', function(users){
					expect(this).toBe(scope);
					expect(users).toBeTruthy(hans);
					expect(users.get('Username')).toEqual('Igor');
				}, scope);

				expect(TUR.makeRequest).toHaveBeenCalled();
			});

			it('Handles a mix of these cases appropriately', function(){
				TUR.cacheUser(hans);
				expect(hans.summaryObject).toBeTruthy();

				TUR.getUser(['hans', holly, 'Igor'], function(users){
					expect(this).toBe(scope);

					expect(users.length).toEqual(3);
					expect(users[0].summaryObject).toBeTruthy();
					expect(users[0]).toBe(hans);
					expect(users[1].summaryObject).toBeFalsy();
					expect(users[1]).toBe(holly);
					expect(users[2].get('Username')).toEqual('Igor');
				}, scope);

				expect(TUR.makeRequest).not.toHaveBeenCalledWith('hans', jasmine.any(Object), undefined);
				expect(TUR.makeRequest).toHaveBeenCalledWith('holly', jasmine.any(Object), undefined);
				expect(TUR.makeRequest).toHaveBeenCalledWith('Igor', jasmine.any(Object), undefined);
				TUR.getStore().remove(hans);
			});
		});
	});

	describe('getUser maintains order', function(){
		function mockMakeRequest(repo, users){
			var result = {
				finishUser: function(u){
					this[u]();
				}
			};

		spyOn(repo, 'makeRequest').andCallFake(function(username, callbacks){
				var user = users[username],
					callback = user ? callbacks.success : callbacks.failure;

				if(user){
					user.summaryObject = false;
				}

				result[username] = function(){
					Ext.callback(callback, callbacks.scope, [user]);
				};
			});

			return result;
		}

		var hans, holly, makeRequest;

		beforeEach(function(){
			hans = createUser('hans');
			holly =  createUser('holly');
			makeRequest = mockMakeRequest(TUR, {
				'hans': hans,
				'holly': holly
			});
		});

		it('maintaines order independent of response order', function(){
			var names = ['hans', 'holly'];

			TUR.getUser(names, function(users){
				var resolvedNames = Ext.Array.map(users, function(u){ return u.getId()});
				expect(resolvedNames).toEqual(names);
			});

			expect(TUR.makeRequest).toHaveBeenCalledWith('hans', jasmine.any(Object), undefined);
			expect(TUR.makeRequest).toHaveBeenCalledWith('holly', jasmine.any(Object), undefined);

			//Trigger make request to finish in the opposite order we requested
			makeRequest.finishUser('holly');
			makeRequest.finishUser('hans');
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
						var i, cb = this.options.callback,
							resp = {},
							respObject = { Items: []};

						for( i in object.Items){
							//respObject.Items[i] = object.Items[i];
						}

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
				var i = i.data || i;

				i.Presence = (i.Presence && i.Presence.data) || i.Presence;

				return i;
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

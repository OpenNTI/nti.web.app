describe("Stream Store Tests", function() {
	var store;

	function createChange(id, lm){
		return NextThought.model.Change.create({
			NTIID: id,
			'Last Modified': lm
		});
	}

	beforeEach(function(){
		store = NextThought.store.Stream.create();
	});

	describe('proxy tests', function(){
		var proxy;
		beforeEach(function(){
			proxy = store.proxy;
		});

		it('Proper start and limit params', function(){
			var opts = {'start': 5, limit: 6},
				params = proxy.getParams(opts);

			expect(params.batchSize).toBe(6);
			expect(params.batchBefore).toBe(5);
		});

		it('getParams strips null', function(){
			var opts = {'start': null, limit: 6},
				params = proxy.getParams(opts);

			expect(params.batchSize).toBe(6);
			expect(params.batchBefore).toBeUndefined();
		});
	});

	describe('unfliteredlast', function(){

		var changes;
		beforeEach(function(){
			changes = Ext.Array.map(['1','2','3'], function(o){return createChange(o);});
			store.add(changes);
		});

		it('Returns last item if not filtered', function(){
			expect(store.getCount()).toBe(3);
			expect(store.unfilteredLast()).toBe(changes.last());
		});

		it('Returns last item if not filtered', function(){

			store.filterBy(function(rec){
				return rec.get('NTIID') !== '3';
			});

			expect(store.getCount()).toBe(2);
			expect(store.last()).toBe(changes[1]);
			expect(store.unfilteredLast()).toBe(changes.last());
		});
	});

	it('Doesn\'t support previousPage', function(){
		expect(store.previousPage).toThrow();
	});

	describe('Load page', function(){

		beforeEach(function(){
			spyOn(store, 'read');
		});

		it('Can load first page', function(){

			function loadFirst(){
				store.loadPage(1);
			}

			expect(loadFirst).not.toThrow();
			expect(store.read).toHaveBeenCalled();
		});

		it('Can load n+1 page', function(){

			function load(){
				store.loadPage(6);
			}
			store.currentPage = 5;
			expect(load).not.toThrow();
			expect(store.read).toHaveBeenCalled();
		});

		it('throws for others', function(){

			function load(){
				store.loadPage(6);
			}
			store.currentPage = 2;
			expect(load).toThrow();
			expect(store.read).not.toHaveBeenCalled();
		});

		it('first page has no start', function(){
			var options;
			store.loadPage(1);
			expect(store.read).toHaveBeenCalled();
			options = store.read.calls[0].args[0];
			expect(options.start).toBeUndefined();
		});

		it('n+1 page uses start of earliest objects lastmod', function(){
			var start = new Date(),
				changes = Ext.Array.map(['1', '2', '3'], function(o, i){
					return createChange(o, new Date(start.getTime() + (1000 * i)));
				}),
				opts;
			store.add(changes);
			store.loadPage(2);
			expect(store.read).toHaveBeenCalled();
			opts = store.read.calls[0].args[0];
			expect(opts.start).toBe(start.getTime()/1000);
		});
	});

	describe('load', function(){

		beforeEach(function(){
			spyOn(store.proxy, 'read');
			store.proxy.url = 'www.google.com';
		});

		it('provided start makes it through', function(){
			var opts;
			store.load({start: 10});
			expect(store.proxy.read).toHaveBeenCalled();
			opts = store.proxy.read.calls[0].args[0];
			expect(opts.start).toBe(10);
		});

		it('start defaults to null', function(){
			var opts;
			store.load();
			expect(store.proxy.read).toHaveBeenCalled();
			opts = store.proxy.read.calls[0].args[0];
			expect(opts.start).toBeNull();
		});

		function proxyCallbackWith(){
			var args = Array.prototype.slice.call(arguments);
			store.proxy.read.andCallFake(function(opts){
				args[1] = opts;
				Ext.callback(opts.callback, store, args);
			});
		}

		it('Still calls provided callback', function(){
			var myCb = jasmine.createSpy('myCb'), opts = {callback: myCb, foo: 'bar'};
			proxyCallbackWith([], opts, true);

			expect(store.mayHaveAdditionalPages).toBeUndefined();
			store.load(opts);

			expect(store.proxy.read).toHaveBeenCalled();
			expect(myCb).toHaveBeenCalledWith([], jasmine.any(Object), true);
			opts = myCb.calls[0].args[1];
			expect(opts.foo).toBe('bar');
		});

		it('has additional pages before any loads', function(){
			expect(store.hasAdditionalPagesToLoad()).toBeTruthy();
		});

		describe('load influences hasAdditionalPagesToLoad', function(){

			it('No more pages if load less than limit', function(){
				var opts = {limit: 100};
				proxyCallbackWith([1, 2, 3, 4], opts, true);
				store.load(opts);
				expect(store.mayHaveAdditionalPages).toBeDefined();
				expect(store.hasAdditionalPagesToLoad()).toBeFalsy();
			});

			it('on failure still more pages', function(){
				var opts = {limit: 100};
				proxyCallbackWith([], opts, false);
				store.load(opts);
				expect(store.mayHaveAdditionalPages).toBeDefined();
				expect(store.hasAdditionalPagesToLoad()).toBeTruthy();
			});

			it('404 is the same as no more', function(){
				var opts = {limit: 100, response: {status: 404}};
				proxyCallbackWith([], opts, false);
				store.load(opts);
				expect(store.mayHaveAdditionalPages).toBeDefined();
				expect(store.hasAdditionalPagesToLoad()).toBeFalsy();
			});

			it('more pages if load hits limit', function(){
				var opts = {limit: 4};
				proxyCallbackWith([1, 2, 3, 4], opts, true);
				store.load(opts);
				expect(store.mayHaveAdditionalPages).toBeDefined();
				expect(store.hasAdditionalPagesToLoad()).toBeTruthy();
			});
		});
	});
});


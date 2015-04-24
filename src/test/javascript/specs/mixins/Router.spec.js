describe('Router mixin tests', function() {
	var router;

	beforeEach(function() {
		router = NextThought.mixins.Router.create({});
	});

	it('trimRoute works correctly', function() {
		var url = router.trimRoute('/root/path1/path2/');

		expect(url).toEqual('root/path1/path2');
	});

	describe('Adding a route gets put into the right place', function() {
		beforeEach(function() {
			router.__routeMap = {};
		});

		it('it two sub routes', function() {
			var a = '/root',
				b = '/root/path1',
				c = '/root/path2';

			function fn1() {
				console.log('root');
			}

			function fn2() {
				console.log('rooot path 1');
			}

			function fn3() {
				console.log('root path 2');
			}

			router.addRoute(a, fn1);
			router.addRoute(b, fn2);
			router.addRoute(c, fn3);

			expect(router.__routeMap.root.handler).toBe(fn1);
			expect(router.__routeMap.root.path1.handler).toBe(fn2);
			expect(router.__routeMap.root.path2.handler).toBe(fn3);
		});

		it('variable route', function() {
			var a = '/root',
				b = '/root/:test',
				c = '/root/:test/path1';

			function fn1() {
				console.log('root');
			}

			function fn2() {
				console.log('root :test');
			}

			function fn3() {
				console.log('root :test path1');
			}

			router.addRoute(a, fn1);
			router.addRoute(b, fn2);
			router.addRoute(c, fn3);

			expect(router.__routeMap.root.handler).toBe(fn1);
			expect(router.__routeMap.root['@var'].varName).toBe('test');
			expect(router.__routeMap.root['@var'].handler).toBe(fn2);
			expect(router.__routeMap.root['@var'].path1.handler).toBe(fn3);
		});


		it('invalid route', function() {
			var err = false;

			try {
				router.addRoute('', function() {});
			} catch (e) {
				err = e;
			}

			expect(err).toBeTruthy();
		});

		it('route collision', function() {
			var err,
				a = '/root/path1',
				b = '/root/path1';

			try {
				router.addRoute(a, function() {});
				router.addRoute(b, function() {});
			} catch (e) {
				err = e;
			}

			expect(err).toBeTruthy();
		});
	});

	describe('Handling routes is done correctly', function() {
		beforeEach(function() {
			router.__routeMap = {};
		});

		it('sub routes get called correclty', function() {
			var a = '/root/',
				b = '/root/path/:test/path1/',
				c = '/root/path/:test/path2/:foo',
				path, params, subRoute;

			function fn(route, subroute) {
				path = route.path;
				params = route.params;
				subRoute = subroute;
			}

			router.addRoute(a, fn);
			router.addRoute(b, fn);
			router.addRoute(c, fn);

			router.handleRoute('/root/subPath1');

			expect(path).toBe('/root/subPath1');
			expect(params).toEqual({});
			expect(subRoute).toBe('/subPath1');

			router.handleRoute('/root/path/a/path1/subPath1/subPath2');

			expect(path).toBe('/root/path/a/path1/subPath1/subPath2');
			expect(params).toEqual({test: 'a'});
			expect(subRoute).toBe('/subPath1/subPath2');

			router.handleRoute('root/path/b/path2/c/subPath2/subPath3');

			expect(path).toBe('/root/path/b/path2/c/subPath2/subPath3');
			expect(params).toEqual({test: 'b', foo: 'c'});
			expect(subRoute).toBe('/subPath2/subPath3');
		});

		it('default route gets called', function() {
			var a = '/root/',
				called = '';

			function fn() {
				called = 'root';
			}

			function defFn() {
				called = 'default';
			}

			router.addRoute(a, fn);
			router.addDefaultRoute(defFn);

			router.handleRoute('/root/');

			expect(called).toEqual('root');

			router.handleRoute('/unknown/');

			expect(called).toEqual('default');
		});
	});
	
	describe('Adding a subroute', function() {
		var parent, first, second, testCtrl;

		beforeEach(function() {
			//the push and replace function will be set on the main view by the 
			//application controller, so fake that out here
			testCtrl = {
				pushRootRoute: function() {},
				replaceRootRoute: function() {}
			};

			parent = NextThought.mixins.Router.create({});
			first = NextThought.mixins.Router.create({});
			second = NextThought.mixins.Router.create({});

			parent.currentRoute = 'first';
			parent.getTitle = function() { return 'parent'; }

			parent.pushRootRoute = function(title, url) { testCtrl.pushRootRoute(title, url); }
			parent.replaceRootRoute = function(title, url) { testCtrl.replaceRootRoute(title, url); }

			first.currentRoute = 'second';
			first.getTitle = function() { return 'first'; }

			second.currentRoute = 'foo';
			second.getTitle = function() { return 'second'; }

			first.addParentRouter(parent);
			second.addParentRouter(first);

			spyOn(parent, 'pushRoute').andCallThrough();
			spyOn(parent, 'replaceRoute').andCallThrough();
			spyOn(testCtrl, 'pushRootRoute').andCallThrough();
			spyOn(testCtrl, 'replaceRootRoute').andCallThrough();
			spyOn(first, 'pushRoute').andCallThrough();
			spyOn(first, 'replaceRoute').andCallThrough();
		});

		it('pushRoute', function() {
			second.pushRoute('second', 'third');

			expect(first.pushRoute).toHaveBeenCalledWith('first | second', 'second/third');
			expect(parent.pushRoute).toHaveBeenCalledWith('parent | first | second', 'first/second/third');
		});

		it('replaceRoute', function() {
			second.replaceRoute('second', 'third');

			expect(first.replaceRoute).toHaveBeenCalledWith('first | second', 'second/third');
			expect(parent.replaceRoute).toHaveBeenCalledWith('parent | first | second', 'first/second/third');
		});

		it('pushRootRoute', function() {
			debugger;
			second.pushRootRoute('second', 'third');

			expect(testCtrl.pushRootRoute).toHaveBeenCalledWith('second', 'third');
		});

		it('replaceRootRoute', function() {
			second.replaceRootRoute('second', 'third');

			expect(testCtrl.replaceRootRoute).toHaveBeenCalledWith('second', 'third');
		});
	});
});

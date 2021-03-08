/* globals spyOn, NextThought */
/* eslint-env jest */
require('internal/legacy/mixins/Router');

const stub = (a, b, c) => jest.spyOn(a, b).mockImplementation(c || (() => {}));

describe('Router mixin tests', () => {
	describe('Path Router Tests', () => {
		var router;

		beforeEach(() => {
			router = NextThought.mixins.Router.create({});
		});

		test('trimRoute works correctly', () => {
			var url = router.trimRoute('/root/path1/path2/');

			expect(url).toEqual('root/path1/path2');
		});

		describe('Adding a route gets put into the right place', () => {
			beforeEach(() => {
				router.__routeMap = {};
			});

			test('it two sub routes', () => {
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

			test('variable route', () => {
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

			test('route collision', () => {
				var err,
					a = '/root/path1',
					b = '/root/path1';

				try {
					stub(console, 'error');
					router.addRoute(a, () => {});
					router.addRoute(b, () => {});
				} catch (e) {
					err = e;
				}

				expect(err).toBeTruthy();
			});
		});

		describe('Handling routes is done correctly', () => {
			beforeEach(() => {
				router.__routeMap = {};
			});

			test('sub routes get called correclty', () => {
				var a = '/root/',
					b = '/root/path/:test/path1/',
					c = '/root/path/:test/path2/:foo',
					path,
					params,
					subRoute,
					precache;

				function fn(route, subroute) {
					path = route.path;
					params = route.params;
					subRoute = subroute;
					precache = route.precache;
				}

				router.addRoute(a, fn);
				router.addRoute(b, fn);
				router.addRoute(c, fn);

				router.handleRoute('/root/subPath1');

				expect(path).toBe('/root/subPath1');
				expect(params).toEqual({});
				expect(subRoute).toBe('/subPath1');
				expect(precache).toEqual({});

				router.handleRoute('/root/path/a/path1/subPath1/subPath2', {
					foo: 'bar',
				});

				expect(path).toBe('/root/path/a/path1/subPath1/subPath2');
				expect(params).toEqual({ test: 'a' });
				expect(subRoute).toBe('/subPath1/subPath2');
				expect(precache).toEqual({ foo: 'bar' });

				router.handleRoute('root/path/b/path2/c/subPath2/subPath3');

				expect(path).toBe('/root/path/b/path2/c/subPath2/subPath3');
				expect(params).toEqual({ test: 'b', foo: 'c' });
				expect(subRoute).toBe('/subPath2/subPath3');
				expect(precache).toEqual({});
			});

			test('default route handler gets called', () => {
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

			test('default route path gets called', () => {
				var a = '/root/',
					called = '';

				function fn() {
					called = 'root';
				}

				router.addRoute(a, fn);
				router.addDefaultRoute(a);

				router.handleRoute('/unknown/');

				expect(called).toEqual('root');
			});
		});

		describe('Adding a subroute', () => {
			var parent, first, second, testCtrl;

			beforeEach(() => {
				//the push and replace function will be set on the main view by the
				//application controller, so fake that out here
				testCtrl = {
					pushRootRoute: () => {},
					replaceRootRoute: () => {},
				};

				parent = NextThought.mixins.Router.create({});
				first = NextThought.mixins.Router.create({});
				second = NextThought.mixins.Router.create({});

				parent.currentRoute = 'first';
				parent.getRouteTitle = () => {
					return 'parent';
				};

				parent.pushRootRoute = function (title, url) {
					testCtrl.pushRootRoute(title, url);
				};
				parent.replaceRootRoute = function (title, url) {
					testCtrl.replaceRootRoute(title, url);
				};

				first.currentRoute = 'second';
				first.getRouteTitle = () => {
					return 'first';
				};

				second.currentRoute = 'foo';
				second.getRouteTitle = () => {
					return 'second';
				};

				parent.addChildRouter(first);
				first.addChildRouter(second);

				spyOn(parent, 'pushRoute').and.callThrough();
				spyOn(parent, 'replaceRoute').and.callThrough();
				spyOn(testCtrl, 'pushRootRoute').and.callThrough();
				spyOn(testCtrl, 'replaceRootRoute').and.callThrough();
				spyOn(first, 'pushRoute').and.callThrough();
				spyOn(first, 'replaceRoute').and.callThrough();
			});

			test('pushRoute', () => {
				second.pushRoute('second', 'third');

				expect(first.pushRoute).toHaveBeenCalledWith(
					'second - first',
					'second/third',
					expect.any(Object)
				);
				expect(parent.pushRoute).toHaveBeenCalledWith(
					'second - first - parent',
					'first/second/third',
					expect.any(Object)
				);
			});

			test('replaceRoute', () => {
				second.replaceRoute('second', 'third');

				expect(first.replaceRoute).toHaveBeenCalledWith(
					'second - first',
					'second/third',
					expect.any(Object)
				);
				expect(parent.replaceRoute).toHaveBeenCalledWith(
					'second - first - parent',
					'first/second/third',
					expect.any(Object)
				);
			});

			test('pushRootRoute', () => {
				second.pushRootRoute('second', 'third');

				expect(testCtrl.pushRootRoute).toHaveBeenCalledWith(
					'second',
					'third'
				);
			});

			test('replaceRootRoute', () => {
				second.replaceRootRoute('second', 'third');

				expect(testCtrl.replaceRootRoute).toHaveBeenCalledWith(
					'second',
					'third'
				);
			});
		});
	});

	describe('Object Router Tests', () => {
		var router;

		beforeEach(() => {
			router = NextThought.mixins.Router.create();
		});

		test('Correct handler gets called', () => {
			var obj = { handler: () => {} },
				note = NextThought.model.Note.create(),
				page = NextThought.model.PageInfo.create();

			spyOn(obj, 'handler');

			router.addObjectHandler(
				[
					NextThought.model.Note.mimeType,
					NextThought.model.PageInfo.mimeType,
				],
				obj.handler
			);

			router.handleObject(note);

			expect(obj.handler).toHaveBeenCalledWith(note);

			router.handleObject(page);

			expect(obj.handler).toHaveBeenCalledWith(page);
		});

		test('Navigate to Object calls parent', function (done) {
			var obj = { parent: () => {}, child: () => {} },
				// first = false, second = false,
				note = NextThought.model.Note.create(),
				page = NextThought.model.PageInfo.create(),
				child = NextThought.mixins.Router.create();

			router.addChildRouter(child);

			spyOn(obj, 'parent').and.callThrough();
			spyOn(obj, 'child').and.callThrough();

			child.addObjectHandler(
				NextThought.model.PageInfo.mimeType,
				obj.child
			);

			router.addObjectHandler(
				[
					NextThought.model.PageInfo.mimeType,
					NextThought.model.Note.mimeType,
				],
				obj.parent
			);

			child
				.navigateToObject(page)
				.then(() => {
					expect(obj.child).toHaveBeenCalledWith(page);
					expect(obj.parent).not.toHaveBeenCalled();

					return child.navigateToObject(note);
				})
				.then(() => {
					expect(obj.child.calls.count()).toEqual(1);
					expect(obj.parent).toHaveBeenCalledWith(note);
				})
				.then(() => {
					done();
				});

			// child.navigateToObject(page)
			// 	.then(() => {
			// 		first = true;
			// 	});

			// waitsFor(() => {
			// 	return first;
			// }, 'navigate never finishes', 500);

			// runs(() => {
			// 	expect(obj.child).toHaveBeenCalledWith(page);
			// 	expect(obj.parent).not.toHaveBeenCalled();

			// 	child.navigateToObject(note)
			// 		.then(() => {
			// 			second = true;
			// 		});
			// });

			// waitsFor(() => {
			// 	return second;
			// }, 'navigate never finishes', 500);

			// runs(() => {
			// 	expect(obj.child.callCount).toEqual(1);
			// 	expect(obj.parent).toHaveBeenCalledWith(note);
			// });
		});
	});
});

describe('History mixin tests', function() {
	var parent;

	beforeEach(function() {
		parent = NextThought.mixins.History.create({
			history_key: 'parent',
			history_title: 'parent',
			history_url: 'parent'
		});

		spyOn(parent, 'pushState').andCallThrough();
		spyOn(parent, 'replaceState').andCallThrough();
	});


	describe('merge state', function() {
		it('with title and url', function() {
			parent.state = {a: 'b'};

			var merged = parent.__mergeChildState('child', {b: 'c'}, 'child', 'child');

			expect(merged.state.a).toBe('b');
			expect(merged.state.child.b).toBe('c');
			expect(merged.title).toBe('parent | child');
			expect(merged.url).toBe('parent/child');
		});

		it('without title and url', function() {
			parent.state = {a: 'b'};

			var merged = parent.__mergeChildState('child');

			expect(merged.state.a).toBe('b');
			expect(merged.state.child).toEqual({});
			expect(merged.title).toBe('');
			expect(merged.url).toBe('');
		});
	});

	describe('child pushing/replacing state', function() {
		var first, second;

		beforeEach(function() {
			first = NextThought.mixins.History.create({
				history_key: 'first',
				history_title: 'first',
				history_url: 'first'
			});

			second = NextThought.mixins.History.create({
				history_key: 'second',
				history_title: 'second',
				history_url: 'second'
			});

			parent.addChildState(first);
			first.addChildState(second);

			spyOn(first, 'pushState').andCallThrough();
			spyOn(first, 'replaceState').andCallThrough();
		});

		it('push state with title and url', function() {
			parent.state = {name: 'parent'};

			first.pushState({name: 'first'}, 'first', 'first');

			expect(parent.pushState).toHaveBeenCalledWith(jasmine.any(Object), 'parent | first', 'parent/first');
			expect(parent.state.name).toBe('parent');
			expect(parent.state.first.name).toBe('first');

			second.pushState({name: 'second'}, 'second', 'second');

			expect(first.pushState).toHaveBeenCalledWith(jasmine.any(Object), 'first | second', 'first/second');
			expect(first.state.name).toBe('first');
			expect(first.state.second.name).toBe('second');

			expect(parent.pushState).toHaveBeenCalledWith(jasmine.any(Object), 'parent | first | second', 'parent/first/second');
			expect(parent.state.name).toBe('parent');
			expect(parent.state.first).toEqual(first.state);
		});

		it('push state without title and url', function() {
			parent.state = {name: 'parent'};

			first.pushState({name: 'first'});

			expect(parent.pushState).toHaveBeenCalledWith(jasmine.any(Object), '', '');
			expect(parent.state.name).toBe('parent');
			expect(parent.state.first.name).toBe('first');

			second.pushState({name: 'second'});

			expect(first.pushState).toHaveBeenCalledWith(jasmine.any(Object), '', '');
			expect(first.state.name).toBe('first');
			expect(first.state.second.name).toBe('second');

			expect(parent.pushState).toHaveBeenCalledWith(jasmine.any(Object), '', '');
			expect(parent.state.name).toBe('parent');
			expect(parent.state.first).toEqual(first.state);
		});

		it('replace state with title and url', function() {
			parent.state = {name: 'parent'};

			first.replaceState({name: 'first'}, 'first', 'first');

			expect(parent.replaceState).toHaveBeenCalledWith(jasmine.any(Object), 'parent | first', 'parent/first');
			expect(parent.state.name).toBe('parent');
			expect(parent.state.first.name).toBe('first');

			second.replaceState({name: 'second'}, 'second', 'second');

			expect(first.replaceState).toHaveBeenCalledWith(jasmine.any(Object), 'first | second', 'first/second');
			expect(first.state.name).toBe('first');
			expect(first.state.second.name).toBe('second');

			expect(parent.replaceState).toHaveBeenCalledWith(jasmine.any(Object), 'parent | first | second', 'parent/first/second');
			expect(parent.state.name).toBe('parent');
			expect(parent.state.first).toEqual(first.state);
		});

		it('push state without title and url', function() {
			parent.state = {name: 'parent'};

			first.replaceState({name: 'first'});

			expect(parent.replaceState).toHaveBeenCalledWith(jasmine.any(Object), '', '');
			expect(parent.state.name).toBe('parent');
			expect(parent.state.first.name).toBe('first');

			second.replaceState({name: 'second'});

			expect(first.replaceState).toHaveBeenCalledWith(jasmine.any(Object), '', '');
			expect(first.state.name).toBe('first');
			expect(first.state.second.name).toBe('second');

			expect(parent.replaceState).toHaveBeenCalledWith(jasmine.any(Object), '', '');
			expect(parent.state.name).toBe('parent');
			expect(parent.state.first).toEqual(first.state);
		});
	});

	describe('child apply state', function() {
		var first, second;

		beforeEach(function() {
			first = NextThought.mixins.History.create({
				history_key: 'first',
				history_title: 'first',
				history_url: 'first'
			});

			second = NextThought.mixins.History.create({
				history_key: 'second',
				history_title: 'second',
				history_url: 'second'
			});

			parent.addChildState(first);
			first.addChildState(second);

			spyOn(parent, 'applyState').andCallThrough();
			spyOn(first, 'applyState').andCallThrough();
			spyOn(second, 'applyState').andCallThrough();
		});


		it('apply with no child states', function() {
			var state = {name: 'parent'},
				cont = false;

			parent.setState(state)
				.then(function() {
					cont = true;
				});

			waitsFor(function() {
				return cont;
			}, 'set state never finishes', 1000);

			runs(function() {
				expect(parent.applyState).toHaveBeenCalledWith(jasmine.any(Object));
				expect(first.applyState).not.toHaveBeenCalled();
				expect(second.applyState).not.toHaveBeenCalled();

				expect(parent.state.name).toBe('parent');
			});
		});

		it('apply with one child state', function() {
			var state = {name: 'parent', first: {name: 'first'}},
				cont = false;

			parent.setState(state)
				.then(function() {
					cont = true;
				});

			waitsFor(function() {
				return cont;
			}, 'set state never finishs', 1000);

			runs(function() {
				expect(parent.applyState).toHaveBeenCalledWith(jasmine.any(Object));
				expect(first.applyState).toHaveBeenCalledWith(jasmine.any(Object));
				expect(second.applyState).not.toHaveBeenCalled();

				expect(parent.state.name).toBe('parent');
				expect(first.state.name).toBe('first');
			});
		});

		it('apply with both child states', function() {
			var state = {name: 'parent', first: {name: 'first', second: {name: 'second'}}},
				cont = false;

			parent.setState(state)
				.then(function() {
					cont = true;
				});

			waitsFor(function() {
				return cont;
			}, 'set state never finishs', 1000);

			runs(function() {
				expect(parent.applyState).toHaveBeenCalledWith(jasmine.any(Object));
				expect(first.applyState).toHaveBeenCalledWith(jasmine.any(Object));
				expect(second.applyState).toHaveBeenCalledWith(jasmine.any(Object));

				expect(parent.state.name).toBe('parent');
				expect(first.state.name).toBe('first');
				expect(second.state.name).toBe('second');
			});
		});
	});
});

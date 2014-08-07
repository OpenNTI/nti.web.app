describe('Promise tests', function() {
	describe('Promise.first tests', function() {
		it('First item is a value', function() {
			var value, rejected;

			Promise.first(['value', 'value2'])
				.then(function(result) {
					value = result;
				})
				.fail(function(reason) {
					rejected = reason;
				});

			waitsFor(function() {
				return value || rejected;
			}, 'First failed to fulfill', 600);

			runs(function() {
				expect(value).toEqual('value');
				expect(rejected).toBeFalsy();
			});
		});

		it('First item is a function that returns a value', function() {
			var value, rejected;

			Promise.first([function() { return 'value'; }, 'value2'])
				.then(function(result) {
					value = result;
				})
				.fail(function(reason) {
					rejected = reason;
				});

			waitsFor(function() {
				return value || rejected;
			}, 'First failed to fulfill', 600);

			runs(function() {
				expect(value).toEqual('value');
				expect(rejected).toBeFalsy();
			});
		});

		it('First item is a function that returns a promise', function() {
			var value, rejected;

			Promise.first([
					function() {
						return Promise.resolve('value');
					},
					'value2'
				])
				.then(function(result) {
					value = result;
				})
				.fail(function(reason) {
					rejected = reason;
				});

			waitsFor(function() {
				return value || rejected;
			}, 'First failed to fulfill', 600);

			runs(function() {
				expect(value).toEqual('value');
				expect(rejected).toBeFalsy();
			});
		});


		function buildRandom(success) {
			var items = [], i,
				correct = Math.floor(Math.random() * 10);

			for (i = 0; i < 10; i++) {
				if (i === correct) {
					items.push(success);
				} else {
					items.push(function() {
						return Promise.reject('rejected');
					});
				}
			}

			return items;
		}


		it('Random item in the array is a value', function() {
			var value, rejected,
				items = buildRandom('value');

			Promise.first(items)
				.then(function(result) {
					value = result;
				})
				.fail(function(reason) {
					rejected = reason;
				});

			waitsFor(function() {
				return value || rejected;
			}, 'First failed to fulfill', 600);

			runs(function() {
				expect(value).toEqual('value');
				expect(rejected).toBeFalsy();
			});
		});

		it('Random item in the array is a function that returns a value', function() {
			var value, rejected,
				items = buildRandom(function() { return 'value'; });

			Promise.first(items)
				.then(function(result) {
					value = result;
				})
				.fail(function(reason) {
					rejected = reason;
				});

			waitsFor(function() {
				return value || rejected;
			}, 'First failed to fulfill', 600);

			runs(function() {
				expect(value).toEqual('value');
				expect(rejected).toBeFalsy();
			});
		});

		it('Random item in the array is a function that returns a fulfilled promise', function() {
			var value, rejected,
				items = buildRandom(function() {
					return Promise.resolve('value');
				});

			Promise.first(items)
				.then(function(result) {
					value = result;
				})
				.fail(function(reason) {
					rejected = reason;
				});

			waitsFor(function() {
				return value || rejected;
			}, 'First failed to fulfill', 600);

			runs(function() {
				expect(value).toEqual('value');
				expect(rejected).toBeFalsy();
			});
		});

		it('No item in the array is successful', function() {
			var value, rejected,
				items = buildRandom(function() {
					return Promise.reject('rejected');
				});

			Promise.first(items)
				.then(function(result) {
					value = result;
				})
				.fail(function(reason) {
					rejected = reason;
				});

			waitsFor(function() {
				return value || rejected;
			}, 'First failed to fulfill', 600);

			runs(function() {
				expect(value).toBeFalsy();
				expect(rejected).toBeTruthy();
			});
		});
	});
});

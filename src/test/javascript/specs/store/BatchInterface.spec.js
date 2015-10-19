describe('BatchInterface tests', function() {

	it('No URL returns a bad batch', function() {
		var batchInterface = NextThought.store.BatchInterface.create({}),
			batch, done = false;

		batchInterface.getBatch()
			.then(function(b) {
				done = true;
				batch = b;
			});

		waitsFor(function() {
			return done;
		}, 'getBatch never finishs', 500);

		runs(function() {
			expect(batch).toBeTruthy();
			expect(batch.isBad).toBeTruthy();
		});
	});


	describe('Default getNextConfig and getPreviousConfig from the bath links', function() {
		var batchInterface, urls = {
				previous: 'previous url',
				current: 'current url',
				next: 'next url'
			};

		beforeEach(function() {
			batchInterface = NextThought.store.BatchInterface.create({
				url: urls.current
			});

			spyOn(batchInterface, '__loadBatch').andCallFake(function(url) {
				return Promise.resolve({
					href: url,
					Items: [],
					Links: [
						{
							href: urls.previous,
							rel: 'batch-previous'
						},
						{
							href: urls.next,
							rel: 'batch-next'
						}
					]
				});
			});
		});

		it('batch-next', function() {
			var next, done = false;

			batchInterface.getNextBatch()
				.then(function(b) {
					next = b;

					done = true;
				});

			waitsFor(function() {
				return done;
			}, 'getNextBatch never finishes', 500);

			runs(function() {
				expect(next).toBeTruthy();
				expect(next.getUrl()).toBe(urls.next);
			});
		});

		it('batch-previous', function() {
			var previous, done = false;

			batchInterface.getPreviousBatch()
				.then(function(b) {
					previous = b;

					done = true;
				});

			waitsFor(function() {
				return done;
			}, 'getNextBatch never finishes', 500);

			runs(function() {
				expect(previous).toBeTruthy();
				expect(previous.getUrl()).toBe(urls.previous);
			});
		});
	});
});

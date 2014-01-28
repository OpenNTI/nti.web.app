describe('Library Store', function() {

	function isTopicElement(v) {
		expect(v).toBeTruthy();
		expect(v && v.tagName).toBeTruthy();
		expect(v && v.tagName).toBe('topic');
	}

	beforeEach(function() {
		Library.clearListeners(); //don't invoke the UI
		Library.getStore().removeAll();
		Library.load();

		waitsFor(
			function() { return Library.loaded; },
			'Library load never completed',
			4000
		);
	});


	it('can determine navigation', function() {
		var n = ContentUtils.getNavigationInfo('tag:nextthought.com,2011-10:test-HTML-book2-1-1');
		expect(n).toBeTruthy();
		expect(n.next).toBe('tag:nextthought.com,2011-10:test-HTML-book2-1-2');
		expect(n.previous).toBe('tag:nextthought.com,2011-10:test-HTML-book2-1-0');
	});


	it('can find the section', function() {
		var l = ContentUtils.find('tag:nextthought.com,2011-10:test-HTML-book2-1-1');
		expect(l).toBeTruthy();
		expect(l.toc).toBeTruthy();
		expect(l.NTIID).toBeTruthy();
		expect(l.ContentNTIID).toBeTruthy();
		expect(typeof l.NTIID === 'string').toBeTruthy();
		expect(typeof l.ContentNTIID === 'string').toBeTruthy();

		expect(Object.prototype.toString.call(l.toc)).toBe('[object Document]');
		expect(Object.prototype.toString.call(l.location)).toBe('[object Element]');

		isTopicElement(l.location);
	});




	it('can find the title of the section', function() {
		expect(ContentUtils.findTitle('tag:nextthought.com,2011-10:test-HTML-book1-1-1')).toBe('section b');
	});



	it('can find the title of the book', function() {
		var t = Library.getTitle('/book2/eclipse-toc.xml');
		expect(t.get('title')).toBe('book2');
	});


	it('can handle Structured NTI IDs', function() {
		expect(ContentUtils.find('tag:nextthought.com,2011-07-14:AOPS-HTML-prealgebra-69')).toBeTruthy();
	});
});

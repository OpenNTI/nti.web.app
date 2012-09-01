describe('Library Store', function(){

	function isTopicElement(v){
		expect(v).toBeTruthy();
		expect(v.tagName).toBeTruthy();
		expect(v.tagName).toBe('topic');
	}

	beforeEach(function(){
		Library.clearListeners(); //don't invoke the UI
		Library.getStore().removeAll();
		Library.load();

		waitsFor(
			function(){ return Library.loaded; },
			"Library load never completed",
			4000
		);
	});

	it('can determine navigation', function(){
		var n = LocationProvider.getNavigationInfo('book2-1-1');

		expect(n).toBeTruthy();
		isTopicElement(n.current);
		isTopicElement(n.next);
		isTopicElement(n.previous);

		expect(n.hasNext).toBeTruthy();
		expect(n.hasPrevious).toBeTruthy();

		expect(n.nextRef).toBeTruthy();
		expect(n.previousRef).toBeTruthy();
	});


	it('can find the section', function(){
		var l = LocationProvider.find('book2-1-1');
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




	it('can find the title of the section', function(){
		expect(LocationProvider.findTitle('book1-1-1')).toBe('section b');
	});



	it('can find the title of the book', function(){
		var t = LocationProvider.getTitle('/book2/eclipse-toc.xml');
		expect(t.get('title')).toBe('book2');
	});


	it('can handle Structured NTI IDs', function(){
		expect(LocationProvider.find('tag:nextthought.com,2011-07-14:AOPS-HTML-prealgebra-69')).toBeTruthy();
	});
});

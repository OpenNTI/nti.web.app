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






	it('should have titles (for tests)', function(){
		expect(Library.getStore().count()).toBeGreaterThan(0);
	});




	it('can find the section', function(){
		var l = Library.find('book2-1-1');
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
		expect(Library.findTitle('book1-1-1')).toBe('section b');
	});



	it('can find the title of the book', function(){
		var t = Library.getTitle('/book2/eclipse-toc.xml');
		expect(t.get('title')).toBe('book2');
	});


	it('can handle Structured NTI IDs', function(){
		expect(Library.find('tag:nextthought.com,2011-07-14:AOPS-HTML-prealgebra-69')).toBeTruthy();
	});

});

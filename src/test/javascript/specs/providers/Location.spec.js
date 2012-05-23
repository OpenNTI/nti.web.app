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
});

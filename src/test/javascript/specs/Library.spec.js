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

});

describe('Search Controller Tests', function(){

	var controller;

	beforeEach(function(){
		controller = app.getController('Search');
	});

	describe('mimeToXType', function(){
		it('none gets default search-result', function(){
			expect(controller.mimeToXType()).toBe('search-result');
			expect(controller.mimeToXType('')).toBe('search-result');
		});

		it('transforms mimes correctly', function(){
			expect(controller.mimeToXType('application/vnd.nextthought.transcriptsummary')).toBe('search-result-transcriptsummary');
			expect(controller.mimeToXType('application/vnd.nextthought.forums.communityheadlinetopic')).toBe('search-result-forums-communityheadlinetopic');
		});
	});
});

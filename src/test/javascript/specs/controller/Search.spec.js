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

	describe('component for hit', function(){

		function createHit(mime){
			return NextThought.model.Hit.create({'MimeType': 'application/vnd.nextthought.'+mime});
		}

		function componentFromCfg(cfg){
			cfg = Ext.apply(cfg, {fillInData: Ext.emptyFn});
			return Ext.ComponentManager.create(cfg);
		}

		it('book, content, and highlights all get the old search result', function(){
			var hits = [createHit('note'), createHit('highlight'), createHit('bookcontent')];

			Ext.Array.each(hits, function(hit){
				var cmp = componentFromCfg(controller.componentConfigForHit(hit));

				expect(cmp).toBeTruthy();
				expect(cmp.$className).toBe('NextThought.view.menus.search.Result');
				cmp.destroy();
			});
		});

		xit('chat gets it\'s own component', function(){

		});

		xit('Topic and topic comments share a component', function(){

		});

		xit('Blogs and blog comment share a component', function(){

		});
	});
});

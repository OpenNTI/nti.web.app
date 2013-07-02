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

	function createHit(mime){
		return NextThought.model.Hit.create({'MimeType': 'application/vnd.nextthought.'+mime, 'Type': Ext.String.capitalize(mime)});
	}

	describe('component for hit', function(){

		function componentFromCfg(cfg){
			cfg = Ext.apply(cfg, {fillInData: Ext.emptyFn});
			return Ext.ComponentManager.create(cfg);
		}

		function verifyHitsAreType(hits, type){

			Ext.Array.each(hits, function(hit){
				var cmp = componentFromCfg(controller.componentConfigForHit(hit));

				expect(cmp).toBeTruthy();
				expect(cmp.$className).toBe(type);
				cmp.destroy();
			});
		}

		it('book, content, and highlights all get the old search result', function(){
			var hits = [createHit('note'), createHit('highlight'), createHit('bookcontent')];
			verifyHitsAreType(hits, 'NextThought.view.menus.search.Result');
		});

		it('chat gets it\'s own component', function(){
			var hits = [createHit('messageinfo')];
			verifyHitsAreType(hits, 'NextThought.view.menus.search.Result-Chat');
		});

		it('Topic and topic comments share a component', function(){
			var hits = [createHit('forums.communityheadlinepost'), createHit('forums.generalforumcomment')];
			verifyHitsAreType(hits, 'NextThought.view.menus.search.ForumResult');
		});

		it('Blogs and blog comment share a component', function(){
			var hits = [createHit('forums.personalblogentrypost'), createHit('forums.personalblogcomment')];
			verifyHitsAreType(hits, 'NextThought.view.menus.search.BlogResult');
		});
	});

	describe('results loading', function(){
		//We use the global controller here b/c
		//but we are very careful to mock or override
		//things that would mutate global state.
		//may want to consider creating a new instance
		//of the controller for these

		//Shortbut to the menu to make things easier
		var testBody, navMenu, menu;
		beforeEach(function(){

			//Any mocking has to occur before calling init

			testBody = document.createElement('div');
			document.body.appendChild(testBody);


			//Can't figure out how to get this by rendering
			//ViewSelect.  If I create  ViewSelect I can't get the
			//menu to render without forcing it explicitly, but
			//then add doesn't work
			menu = Ext.widget({
				xtype: 'navigation-menu',

				layout: {type: 'vbox', align: 'stretch'},
				overflowX: 'hidden',
				overflowY: 'hidden',
				items:[
					//{ xtype: 'searchfield' },
					{ xtype: 'container',
					  overflowX: 'hidden',
					  overflowY: 'scroll',
					  id: 'search-results',
					  hideMode: 'display',
					  flex: 1 }
				],
				renderTo: testBody
			});

			//Why the heck can't we use andReturn here...
			spyOn(menu, 'hide').andCallFake(function(){
				return menu;
			});
			spyOn(menu, 'show');


			menu.el.mask();
			spyOn(controller, 'getSearchResultsMenu').andReturn(menu);

			expect(menu.el.isMasked()).toBeTruthy();
		});

		afterEach(function(){
			menu.destroy();

			//Where are we polluting this from?
			var s = Ext.ComponentQuery.query('#search-results');

			//FIXME: Apparently ExtJS doesn't clean up menus, since destroying the parent menu should have cleaned everything.
			// So we check and clean.
			if(!Ext.isEmpty(s)){
				s = s.first();
				s.destroy();
			}

			document.body.removeChild(testBody);
		});

		it('Unmasks on successfull load', function(){
			controller.storeLoad(controller.getHitStore(), [], true);
			expect(menu.el.isMasked()).toBeFalsy();
		});

		it('Unmasks on failure load', function(){
			controller.storeLoad(controller.getHitStore(), [], false);
			expect(menu.el.isMasked()).toBeFalsy();
		});

		it('Shows an error on failure', function(){
			var category, err;

			controller.storeLoad(controller.getHitStore(), [], false);

			//For an error we should have one category that has a child of search result
			category = menu.query('search-result-category');
			expect(category.length).toBe(1);
			category = category.first();

			err = category.query('search-error');
			expect(err.length).toBe(1);
		});

		describe('Results grouping', function(){

			var categories;

			beforeEach(function(){
				//Load up one of each type of results

				var mimes = ['bookcontent', 'note', 'highlight', 'messageinfo',
							 'forums.communityheadlinepost', 'forums.generalforumcomment',
							 'forums.personalblogentrypost', 'forums.personalblogcomment'],
					hits = Ext.Array.map(mimes, createHit);

				controller.getHitStore().add(hits);
				controller.storeLoad(controller.getHitStore(), hits, true);

				categories = menu.query('search-result-category');
			})

			it('Known groups get shown', function(){
				var names = [];

				//Should have six groups.  Books, Highlights, Notes
				//Chats, Forums, Blos
				expect(categories.length).toBe(6);
				names = Ext.Array.pluck(categories, 'category');

				expect(Ext.Array.sort(names)).toEqual(['Books', 'Chats', 'Forums', 'Highlights', 'Notes', 'Thoughts']);
			});

			it('Shows all forum results in one group', function(){
				var forumsCat = menu.down('search-result-category[category=Forums]');
				expect(forumsCat).toBeTruthy();
				expect(forumsCat.query('search-result').length).toBe(2);
			});

			it('Shows all blog results in one group', function(){
				var thoughsCat = menu.down('search-result-category[category=Thoughts]');
				expect(thoughsCat).toBeTruthy();
				expect(thoughsCat.query('search-result').length).toBe(2);
			});
		});

	});
});

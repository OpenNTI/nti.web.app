describe('Main Navigation View Tests: ', function(){

	var testBody, navMenu;
	describe('Capability tests', function(){
		beforeEach(function(){
			testBody = document.createElement('div');
			document.body.appendChild(testBody);

			jasmine.Clock.useMock();
			navMenu = NextThought.view.ViewSelect.create({
				renderTo: testBody,
				canHaveForum: function(){ return false; },
				canHaveContacts: function(){ return true; }
			});
		});

		it('hides the forum Nav button based on capability', function(){
			var forumsBtn, contactsBtn;
			jasmine.Clock.tick(2);
			forumsBtn = navMenu.down('[title=Forums]');
			contactsBtn = navMenu.down('[title=Contacts]');

			expect(contactsBtn.isVisible()).toBeTruthy();
			expect(navMenu.canHaveForum()).toBeFalsy();
			expect(forumsBtn.isVisible()).toBeFalsy();
		});

		afterEach(function(){
			navMenu.destroy();
			var s = Ext.ComponentQuery.query('#search-results');
			if(!Ext.isEmpty(s)){
				s = s.first();
				s.destroy();
			}
			document.body.removeChild(testBody);
		});
	});

	describe('DiscussionBoard Link tests', function(){
		var hans, mexicanStickCommunity;

		function createUser(username, additional){
			var cfg = Ext.applyIf(additional || {}, {
				'Username': username
			});
			return new NextThought.model.User(cfg);
		}

		beforeEach(function(){
			testBody = document.createElement('div');
			document.body.appendChild(testBody);

			jasmine.Clock.useMock();
			navMenu = NextThought.view.ViewSelect.create({
				renderTo: testBody,
				canHaveForum: function(){ return true; },
				canHaveContacts: function(){ return true; }
			});
		});

		beforeEach(function(){
			hans = createUser('hans', {'Communities': ['MexicanStickCommunity']});
			mexicanStickCommunity = new NextThought.model.FriendsList({Username: 'MexicanStickCommunity', NTIID: 'foobar', 'IsDynamicSharing': true});

			UserRepository.cacheUser(hans);
			UserRepository.cacheUser(mexicanStickCommunity);
		});


		it('hides forum tab because there is no board in at least one community', function(){
			var forumsBtn;
			jasmine.Clock.tick(1);
			forumsBtn = navMenu.down('[title=Forums]');

			expect(mexicanStickCommunity.getLink('DiscussionBoard')).toBeNull();
			expect(hans.getCommunities().first()).toBe(mexicanStickCommunity);
			expect(forumsBtn.isVisible()).toBeTruthy();

			spyOn(forumsBtn, 'hide').andCallThrough();
			navMenu.shouldShowForumTab(hans);

			expect(forumsBtn.hide).toHaveBeenCalled();
			expect(forumsBtn.isVisible()).toBeFalsy();
		});

		afterEach(function(){
			navMenu.destroy();
			var s = Ext.ComponentQuery.query('#search-results');
			if(!Ext.isEmpty(s)){
				s = s.first();
				s.destroy();
			}

			document.body.removeChild(testBody);
			UserRepository.getStore().remove(hans);
			UserRepository.getStore().remove(mexicanStickCommunity);
		});
	});

});
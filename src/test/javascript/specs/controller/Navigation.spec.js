describe('Navigation Controller Tests', function(){

	var controller, navMenu, testBody;

	beforeEach(function(){
		controller = NextThought.controller.Navigation.create({
			models: [],
			views:[],
			refs: [],
			store:[]
		});

		//init usually gets called automatically when the app is setting up controllers
		//do that here
//		controller.application = app;
//		controller.init(app);
		controller = app.getController('Navigation');
		controller.viewport = { activateView: Ext.emptyFn};

		testBody = document.createElement('div');
		document.body.appendChild(testBody);
		navMenu = Ext.create('NextThought.view.ViewSelect', { renderTo : testBody });
	});

	describe('ToggleContactsOnProfile', function(){

		it('Expects going to Contacts view, to toggle Contacts btn', function(){
			var contactsBtn = navMenu.query('button[title=Contacts]');

			expect(contactsBtn.length).toEqual(1);
			contactsBtn = contactsBtn.first();
			spyOn(contactsBtn, 'toggle').andCallThrough();

			controller.track('Contacts');
			expect(contactsBtn.toggle).toHaveBeenCalled();
			expect(contactsBtn.pressed).toBeTruthy();
		});

		it('Expects going to Profile view to toggle contacts btn', function(){
			var profileBtn = navMenu.query('button[title=Profile]'),
				contactsBtn = navMenu.query('button[title=Contacts]');

			profileBtn = profileBtn.first();
			contactsBtn = contactsBtn.first();

			spyOn(profileBtn, 'toggle').andCallThrough();
			spyOn(contactsBtn, 'toggle').andCallThrough();

			expect(profileBtn.alternateId).toEqual('Contacts');
			controller.track('Profile');

			expect(profileBtn.toggle).not.toHaveBeenCalledWith(true);
			expect(contactsBtn.toggle).toHaveBeenCalled();
			expect(contactsBtn.pressed).toBeTruthy();
		});
	});

	afterEach(function(){
		navMenu.destroy();
		var s = Ext.ComponentQuery.query('#search-results');

		//FIXME: Apparently ExtJS doesn't clean up menus, since destroying the parent menu should have cleaned everything.
		// So we check and clean.
		if(!Ext.isEmpty(s)){
			s = s.first();
			s.destroy();
		}
		document.body.removeChild(testBody);
	});

});
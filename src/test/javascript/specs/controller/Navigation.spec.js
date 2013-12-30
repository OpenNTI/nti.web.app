describe('Navigation Controller Tests', function(){

	var controller, mockObjects, navMenu, testBody, oldViewPort;

	beforeEach(function(){
		controller = app.getController('Navigation');
		oldViewPort = controller.viewport;
		controller.viewport = { activateView: Ext.emptyFn};

		testBody = document.createElement('div');
		document.body.appendChild(testBody);
		navMenu = Ext.create('NextThought.view.Navigation', { renderTo : testBody });

		mockObjects = {
			'book1': Ext.create('NextThought.model.PageInfo', {
				NTIID: 'book1'
			})
		};

	});

	afterEach(function(){
		controller.viewport = oldViewPort;

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

	describe('ToggleContactsOnProfile', function(){

		xit('Expects going to Contacts view, to toggle Contacts btn', function(){
			var contactsBtn = navMenu.query('button[title=Contacts]');

			expect(contactsBtn.length).toEqual(1);
			contactsBtn = contactsBtn.first();
			spyOn(contactsBtn, 'toggle').andCallThrough();

			controller.track('Contacts');
			expect(contactsBtn.toggle).toHaveBeenCalled();
			expect(contactsBtn.pressed).toBeTruthy();
		});

		xit('Expects going to Profile view to toggle contacts btn', function(){
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

	describe('Test navigateToNtiid', function(){
		function mockGetObject(ntiid, success, fail, scope){
			if(mockObjects[ntiid] !== undefined){
				Ext.callback(success, scope, [mockObjects[ntiid]]);
			}
			Ext.callback(fail, scope, []);
		}

		it('Expect to look up and object with the NTIID \'book1\'', function(){
			spyOn(Service, 'getObject').andCallFake(mockGetObject);
			controller.navigateToNtiid('book1');
			expect(Service.getObject).toHaveBeenCalled();
		});
	});

	describe('Test navigateToContent', function(){
		it('Expects going to the content \'book1\'', function(){
			spyOn(controller, 'navigateToContent').andCallThrough();
			controller.navigateToContent(mockObjects['book1']);
			expect(controller.navigateToContent).toHaveBeenCalledWith(mockObjects['book1']);
		});
	});

});

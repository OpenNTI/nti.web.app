describe('Groups Controller Tests', function(){

	var controller;

	beforeEach(function(){
		controller = NextThought.controller.Groups.create({
			models: [],
			views: [],
			refs: [],
			stores: []
		});

		//init usually gets called automatically when the app is setting up controllers
		//do that here
		controller.application = app;
		controller.init(app);
	});

	describe("createGroupAndCode", function(){

		it("Sets Invalid error on 422", function(){
			var btn = jasmine.createSpyObj('button', ['up', 'setDisabled']),
				window = jasmine.createSpyObj('window', ['showError', 'getGroupName']);

			$AppConfig.service.canCreateDynamicGroups = function(){return true;}

			btn.up.andReturn(window);
			window.getGroupName.andReturn('groupname');

			spyOn(controller, 'createDFLUnguarded').andCallFake(function(dn, un, friends, onCreated, onError, scope){
				Ext.callback(onError, scope, [null, {error: 422}, {code: 'SomethingWeHaventSeen'}]);
			});

			controller.createGroupAndCode(btn);

			expect(window.showError.calls.length).toBe(1);
			expect(window.showError).toHaveBeenCalledWith(jasmine.any(String));
		});
	});

});


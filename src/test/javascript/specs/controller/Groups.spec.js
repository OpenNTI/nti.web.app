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
		var btn,w;

		beforeEach(function(){
			btn = jasmine.createSpyObj('button', ['up', 'setDisabled']);
			w = jasmine.createSpyObj('w', ['showError', 'getGroupName']);

			Service.canCreateDynamicGroups = function(){return true;}

			btn.up.andReturn(w);
			w.getGroupName.andReturn('groupname');
		});


		function failCreation(arg1,arg2,arg3){
			spyOn(controller, 'createDFLUnguarded').andCallFake(function(dn, un, friends, onCreated, onError, scope){
				Ext.callback(onError, scope, [arg1,arg2,arg3]);
			});
		}


		it("Sets Invalid error with no message on 422", function(){
			failCreation(null,{error: 422}, {code:'SomethingWeHaventSeen'});

			controller.createGroupAndCode(btn);

			expect(w.showError.calls.length).toBe(1);
			expect(w.showError).toHaveBeenCalledWith(jasmine.any(String));
		});


		it("Sets Invalid error with message on 422", function(){
			failCreation(null,{error: 422}, {code:'SomethingWeHaventSeen', message:'Default Message'});

			controller.createGroupAndCode(btn);

			expect(w.showError.calls.length).toBe(1);
			expect(w.showError).toHaveBeenCalledWith("Default Message");
		});


		it("Sets valid error with no message on 422", function(){
			failCreation(null,{error: 422}, {code:'FieldContainsCensoredSequence'});

			controller.createGroupAndCode(btn);

			expect(w.showError.calls.length).toBe(1);
			expect(w.showError).toHaveBeenCalledWith("Group name contains censored material.");
		});

		it("Sets valid error with message on 422", function(){
			failCreation(null,{error: 422}, {code:'FieldContainsCensoredSequence', message:'Default Message'});

			controller.createGroupAndCode(btn);

			expect(w.showError.calls.length).toBe(1);
			expect(w.showError).toHaveBeenCalledWith("Group name contains censored material.");
		});

	});

});


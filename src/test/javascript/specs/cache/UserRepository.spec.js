describe("User Repository/Store/Cache Behavior", function(){

	it("should automatically add users when a user model is constructed", function()
	{
		var a = Ext.create('NextThought.model.User',{Username: 'test@foo'});
		expect(UserRepository.getUser('test@foo') === a).toBeTruthy();
	});


	it("should only have one instance per id", function()
	{
		var a = Ext.create('NextThought.model.User',{Username: 'test@foo'}),
			b = Ext.create('NextThought.model.User',{Username: 'test@foo', alias: 'Foo'});

		expect(UserRepository.getUser('test@foo') === a).toBeFalsy();
		expect(UserRepository.getUser('test@foo') === b).toBeTruthy();
	});


	it("should use what is given", function()
	{
		spyOn(UserRepository, 'makeRequest');
		UserRepository.prefetchUser({"Class": 'Community', Username: 'TestersAnnon'});

		expect(UserRepository.makeRequest).not.toHaveBeenCalled();

		UserRepository.prefetchUser('jonathan.grimes@foo');
		expect(UserRepository.makeRequest).toHaveBeenCalled();
	});


	it("should maintain user/communty model instances", function()
	{
		expect(UserRepository.getStore().getCount()).toBeGreaterThan(3);//The configured test user, the Community 'TestersAnnon', and the test@foo
	});
});

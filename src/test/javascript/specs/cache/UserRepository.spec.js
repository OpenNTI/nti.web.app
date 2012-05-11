describe("User Repository/Store/Cache Behavior", function(){

	it("should use what is given", function()
	{
		spyOn(UserRepository, 'makeRequest');
		UserRepository.getUser({"Class": 'Community', Username: 'TestersAnnon'});

		//this used to check to make sure communities don't get requested, we no longer resolve
		//users for friends lists so we don't need the workaround to not resolve communities.
		expect(UserRepository.makeRequest).toHaveBeenCalled();

		UserRepository.getUser('jonathan.grimes@foo');
		expect(UserRepository.makeRequest).toHaveBeenCalled();
	});


	it("should maintain user/communty model instances", function()
	{
		expect(UserRepository.getStore().getCount()).toBe(3);//The configured test user, the Community 'TestersAnnon', and the test@foo
	});
});

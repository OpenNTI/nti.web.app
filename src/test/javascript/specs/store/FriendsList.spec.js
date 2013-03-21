describe("Friends List Tests", function() {

	var store;

	beforeEach(function(){
		store = new NextThought.store.FriendsList({});
	});

	it('Fires contacts-updated on load', function(){
		spyOn(store, 'fireEvent').andCallThrough();
		store.loadData([]);

		expect(store.fireEvent).toHaveBeenCalledWith('contacts-updated');
	});
});

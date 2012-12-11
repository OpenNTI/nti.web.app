describe("FriendsList Tests", function() {
    describe ('Property tests', function(){
        it('isDFL is correct', function(){
            var list = Ext.create('NextThought.model.FriendsList', {
                'IsDynamicSharing': false
            });
			var group = Ext.create('NextThought.model.FriendsList', {
                'IsDynamicSharing': true
            });
            expect(list.isDFL).toBeFalsy();
			expect(group.isDFL).toBeTruthy();
        });

		it('readableTyp is correct', function(){
            var list = Ext.create('NextThought.model.FriendsList', {
                'IsDynamicSharing': false
            });
			var group = Ext.create('NextThought.model.FriendsList', {
                'IsDynamicSharing': true
            });
            expect(list.readableType).toEqual('list');
			expect(group.readableType).toEqual('group');
        });
    });
});

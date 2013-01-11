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

	describe('getName is correct', function(){

		function createList(alias, realname, username){
			var list = Ext.create('NextThought.model.FriendsList', {
				alias: alias,
				realname: realname,
				Username: username
			});
			return list;
		}

		it('Prefers alias', function(){
			var list = createList('a', 'b', 'c');
			expect(list.getName()).toEqual('a');
		});

		it('Falls back to realname if no alias', function(){
			var list = createList(null, 'b', 'c');
			expect(list.getName()).toEqual('b');
		});

		it('Falls back to username if nothing else', function(){
			var list = createList(null, null, 'c');
			expect(list.getName()).toEqual('c');
		});

	});
});

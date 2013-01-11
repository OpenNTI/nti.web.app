describe("User Tests", function() {

	describe('getName is correct', function(){

		function createUser(alias, realname, username){
			var user = Ext.create('NextThought.model.User', {
				alias: alias,
				realname: realname,
				Username: username
			});
			return user;
		}

		it('Prefers alias', function(){
			var user = createUser('a', 'b', 'c');
			expect(user.getName()).toEqual('a');
		});

		it('Falls back to realname if no alias', function(){
			var user = createUser(null, 'b', 'c');
			expect(user.getName()).toEqual('b');
		});

		it('Falls back to username if nothing else', function(){
			var user = createUser(null, null, 'c');
			expect(user.getName()).toEqual('c');
		});

	});
});

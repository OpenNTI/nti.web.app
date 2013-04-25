describe('State Controller Tests', function(){

	var controller;

	beforeEach(function(){
		controller = NextThought.controller.State.create({
			models: [],
			views:[],
			refs: [],
			store:[]
		});
	});

	describe('Forum fragment generation', function(){
		var stateObject;

		function getFragment(state){
			return controller.generateForumsFragment(state);
		}

		it('handles junk', function(){
			expect(getFragment({foo: 'bar'})).toBeFalsy();
		});

		it('handles community', function(){
			var expected = 'u/NextThought';
			expect(getFragment({board:{isUser: true,
								community: 'NextThought'}})).toBe(expected);
		});

		it('handles portion', function(){
			var expected = 'u/NextThought/Food';
			expect(getFragment({board:{isUser: true,
								community: 'NextThought'},
								forum: 'Food'})).toBe(expected);
		});

		it('handles all the way through comments', function(){
			var expected = 'u/NextThought/Food/HotDog/1';
			expect(getFragment({board:{isUser: true,
								community: 'NextThought'},
								forum: 'Food',
								topic: 'HotDog',
								comment: '1'})).toBe(expected);
		});
	});

	describe('Forum fragment parsing', function(){

		var fragString;

		function createFragString(parts){
			return '#!forums/'+parts.join('/');
		}

		function getStateObject(parts, dontCheck){
			var result = controller.interpretForumsFragment(createFragString(parts));

			if(!dontCheck){
				expect(result.active).toEqual('forums');
				expect(result.forums).toBeTruthy();
				return result.forums;
			}

			return result;
		}

		it('Requires at least u and Community', function(){
			var obj = getStateObject([], true);

			expect(obj).toEqual({active: 'forums'});

			obj = getStateObject(['u', 'NextThought']);
			expect(obj.board).toBeTruthy();
			expect(obj.board.isUser).toBeTruthy();
			expect(obj.board.community).toBe('NextThought');
		});

		it('handles up through forum', function(){
			var obj = getStateObject(['u', 'NextThought', 'Bearfoot']);
			expect(obj.board).toBeTruthy();
			expect(obj.board.isUser).toBeTruthy();
			expect(obj.board.community).toBe('NextThought');
			expect(obj.forum).toBe('Bearfoot');
		});

		it('handles up through topic', function(){
			var obj = getStateObject(['u', 'NextThought', 'Bearfoot', 'food']);
			expect(obj.board).toBeTruthy();
			expect(obj.board.isUser).toBeTruthy();
			expect(obj.board.community).toBe('NextThought');
			expect(obj.forum).toBe('Bearfoot');
			expect(obj.topic).toBe('food');
		});

		it('handles up through comment', function(){
			var obj = getStateObject(['u', 'NextThought', 'Bearfoot', 'food', 'kids']);
			expect(obj.board).toBeTruthy();
			expect(obj.board.isUser).toBeTruthy();
			expect(obj.board.community).toBe('NextThought');
			expect(obj.forum).toBe('Bearfoot');
			expect(obj.topic).toBe('food');
			expect(obj.comment).toBe('kids');
		});

		it('handles junk', function(){
			var obj = getStateObject(['asdlfkjadls;fkjads;lfkj'], true);
			expect(obj).toEqual({active: 'forums'});
		});
	});

	describe('Object fragment parsing', function(){
		function createFragString(parts){
			return '#!object/'+parts.join('/');
		}

		it('Handle NTIIDs', function(){
			var result = controller.interpretObjectFragment(createFragString(['ntiid', 'tag:nextthought.com,2011-10:NextThought-book1']));

			expect(result).toEqual({'active': 'object', 'domain': 'ntiid', 'ntiid': 'tag:nextthought.com,2011-10:NextThought-book1'});
		});

		it('Handle unknown object domain', function(){
			var result = controller.interpretObjectFragment(createFragString(['foobar', 'asjsdjhadsfljkasd']));

			expect(result).toEqual({});
		});

		it('Handle garbage', function(){
			var result = controller.interpretObjectFragment(createFragString(['ntiid', 'asjsdjhadsfljkasd']));

			expect(result).toEqual({});
		});
	});
});

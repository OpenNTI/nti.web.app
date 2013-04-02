describe("Forum comments test",function(){
	var TAR, oldUserRepo, testBody, comment, noop = function(){};

	beforeEach(function(){
		//mock the user repository
		TUR = {};
		/*jslint sub:true */ //no way to ignore reserved property if using don notation
		TUR['__proto__'] = NextThought.cache.UserRepository['__proto__'];
		TUR.constructor();

		oldUserRepo = UserRepository;
		window.UserRepository = TUR;

		//mock the testBody
		testBody = document.createElement("div");
		document.body.appendChild(testBody);
	});

	afterEach(function(){
		document.body.removeChild(testBody);
		window.UserRepository = oldUserRepo;
	});

	function createNewUser(username,additional){
		var cfg = Ext.applyIf(additional || {}, {
			'Username': username
		});

		return new NextThought.model.User(cfg);
	}

	it('User is cached',function(){
		var user = createNewUser('cached',{ 'alias' : 'cachedName'});
		TUR.cacheUser(user);

		comment = Ext.create('NextThought.view.forums.Comment',{
			record : {
				'data' : {
					'UserName' : 'cached',
					'displayName' : 'cachedName',
				},
				'getData' : function(){
					return 'data';
				},
				'get' : function(){
					return 'cached';
				}
			},
			renderTo : testBody,
			afterRender : noop,
			initComponent: noop
		});

		expect(Ext.fly(testBody).down('.name').dom.innerHTML).toBe('cachedName');
	});

	it('User isnt cached',function(){
		var  user = createNewUser('noncached',{'alias' : 'noncachedName'});

		comment = Ext.create('NextThought.view.forums.Comment',{
			record : {
				'data' : {
					'UserName' : 'cached',
					'displayName' : 'cachedName',
				},
				'getData' : function(){
					return 'data';
				},
				'get' : function(){
					return 'cached';
				}
			},
			renderTo : testBody,
			afterRender : noop,
			initComponent: noop,
			loadUser: noop
		});

		comment.addUser(user);
		expect(Ext.fly(testBody).down('.name').dom.innerHTML).toBe('noncachedName');
	});
});

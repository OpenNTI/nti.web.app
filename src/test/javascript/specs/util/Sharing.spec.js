describe('Sharing Utils', function(){

	var testBody, TestSharingUtils, communities = [], globalAppUserFunc;

	beforeEach(function(){
		TestSharingUtils = NextThought.util.Sharing;
		globalAppUserFunc =  Ext.clone(TestSharingUtils.getAppUserCommunities);
		TestSharingUtils.getAppUserCommunities = function(){ return communities; }

	});

	beforeEach(function(){
		//mock the testBody
		testBody = document.createElement("div");
		document.body.appendChild(testBody);
	});

	function createNewCommunity(username,additional){
		var cfg = Ext.applyIf(additional || {}, {
			'Username': username
		});

		return new NextThought.model.Community(cfg);
	}

	function createNewUser(username,additional){
		var cfg = Ext.applyIf(additional || {}, {
			'Username': username
		});

		return new NextThought.model.User(cfg);
	}

	beforeEach(function(){
		var c1 = createNewCommunity('MathWorld-1', {'alias': 'MathWorld'}),
			c2 = createNewCommunity('DisneyWorld-2', {'alias': 'DisneyWorld'}),
			c3 = createNewCommunity('Zoo1', {'alias': 'ZooKeeper'}),
			user;

		communities.push(c1);
		communities.push(c2);
		communities.push(c3);
		user = createNewUser('user1', {'communities': [c1.getId(), c2.getId(), c3.getId()]});
	});

	describe('From shared with to SharingInfo: ', function(){
		it('entity is shared with all my communities', function(){
			expect(TestSharingUtils.isPublic(['MathWorld-1'])).toBeFalsy();
			expect(TestSharingUtils.isPublic(['MathWorld-1', 'Zoo1', 'DisneyWorld-2'])).toBeTruthy();
		});

		it('explicit share: public with entities', function(){
			var s = ['MathWorld-1', 'Zoo1','testUser3', 'myContacts-1', 'DisneyWorld-2'],
				sharingInfo  = TestSharingUtils.sharedWithToSharedInfo(s);

			expect(sharingInfo.publicToggleOn).toBeTruthy();
			expect(sharingInfo.entities).toEqual(['testUser3', 'myContacts-1']);
		});

		it('explicit share: private with entities', function(){
			var s = ['MathWorld-1', 'Zoo1','testUser3', 'myContacts-1', 'FriendsAtWork-1'],
				sharingInfo  = TestSharingUtils.sharedWithToSharedInfo(s);

			expect(sharingInfo.publicToggleOn).toBeFalsy();
			expect(sharingInfo.entities).toEqual(['MathWorld-1', 'Zoo1','testUser3', 'myContacts-1', 'FriendsAtWork-1']);
		});
	});


	describe('From sharingInfo to sharedWith', function(){
		it('should convert to public ', function(){
			var sharingInfo = {publicToggleOn: true, entities:[]},
				sharedWith = TestSharingUtils.sharedWithForSharingInfo(sharingInfo);

			expect( Ext.Array.difference(sharedWith, ['MathWorld-1', 'Zoo1', 'DisneyWorld-2'])).toEqual([]);
			expect(TestSharingUtils.isPublic(sharedWith)).toBeTruthy();
		});

		it('becomes public and removes duplicates', function(){
			var sharingInfo = {publicToggleOn: true, entities:['Zoo1']},
				sharedWith = TestSharingUtils.sharedWithForSharingInfo(sharingInfo);

			expect(Ext.Array.difference(sharedWith, ['MathWorld-1', 'Zoo1', 'DisneyWorld-2'])).toEqual([]);
		});

		it('is explicit sharing', function(){
			var sharingInfo = {publicToggleOn: false, entities:['Zoo1', 'John-doe-1']},
				sharedWith = TestSharingUtils.sharedWithForSharingInfo(sharingInfo);

			expect(sharedWith).toEqual(['Zoo1', 'John-doe-1']);
		});

		it('is private sharing', function(){
			var sharingInfo = {publicToggleOn: false, entities:[]},
				sharedWith = TestSharingUtils.sharedWithForSharingInfo(sharingInfo);

			expect(sharedWith).toEqual([]);
		});
	});

	describe('getTagSharingInfo', function(){
		it('public without entities', function(){
			var sharingInfo = {publicToggleOn: true, entities: []},
				sharedWith = TestSharingUtils.getTagSharingInfo(sharingInfo,[]);

			expect(Ext.isEmpty(sharedWith.tags)).toBeTruthy();
			expect(Ext.isEmpty(sharedWith.entities)).toBeTruthy();
		});

		it('public with entities', function(){
			var sharingInfo = {publicToggleOn: true, entities: ['a','b']},
				sharedWith = TestSharingUtils.getTagSharingInfo(sharingInfo,['a','b']),
				tagsDiff = Ext.Array.difference(sharedWith.tags, ['a','b']);

			expect(Ext.isEmpty(tagsDiff)).toBeTruthy();
			expect(Ext.isEmpty(sharedWith.entities)).toBeTruthy();
		});
	});

	describe('tagShareToSharedInfo', function(){
		it('No ntiids in the tags is the same as calling sharedWithToSharedInfo', function(){
			var sharedWith = ['a','b'],
				tagSharedWith = TestSharingUtils.tagShareToSharedInfo(sharedWith, ['tag1','tag2']),
				sharingInfo = TestSharingUtils.sharedWithToSharedInfo(sharedWith);

			expect(Ext.Array.equals(tagSharedWith, sharingInfo)).toBeTruthy();
		});

		it('Some ntiids in the tags', function(){
			var tagSharedInfo, diff, sharedWith = ['a','b'],
				ntiids = ['tag:nextthought.com,2011-10:system-NamedEntity:ntiid1'],
				tags = ['tag1','tag2'],
				expected = {
					publicToggleOn: true,
					entities: ntiids
				};

			tags.push(ntiids[0]);

			tagSharedInfo = TestSharingUtils.tagShareToSharedInfo(sharedWith, tags);

			diff = Ext.Array.difference(tagSharedInfo, tags);

			expect(Ext.isEmpty(diff)).toBeTruthy();
		});
	});

	afterEach(function(){
		TestSharingUtils.getAppUserCommunities = globalAppUserFunc;
		document.body.removeChild(testBody);
	});
});
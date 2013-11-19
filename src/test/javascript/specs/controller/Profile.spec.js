describe('Profile controller tests', function(){
	var ctrl;

	beforeEach(function(){
		ctrl = app.getController('Profile');
	});

	describe('handleShareAndPublichState tests', function(){
		var blogEntry, blogPost, ntiids;

		function setUpPost(tags, sharedWith, published){
			blogPost = NextThought.model.forums.PersonalBlogEntryPost.create({
				tags: tags,
				title: 'Test Post'
			});

			blogEntry = NextThought.model.forums.PersonalBlogEntry.create({
				sharedWith: sharedWith.entities,
				headline: blogPost
			});

			spyOn(blogEntry, 'isPublished').andCallFake(function(){
				return published;
			});

			spyOn(blogEntry, 'publish').andCallFake(function(cmp, callback, scope){
				Ext.callback(callback, scope);
			});

			spyOn(blogEntry, 'save');
			spyOn(blogEntry, 'set');
			spyOn(blogPost, 'save');
			spyOn(blogPost, 'set');
		}

		function createFakeUser(ntiid){
			return { get: function(){ return ntiid; } };
		}

		function createUserList(names){
			var result = [];

			Ext.each(names, function(name, index){
				var id = 'tag:nextthought.com,2011-10:system-NamedEntity:ntiid' + index;

				result.push(createFakeUser(id));
			});

			return result;
		}

		beforeEach(function(){
			ntiids = [
				'tag:nextthought.com,2011-10:system-NamedEntity:ntiid1',
				'tag:nextthought.com,2011-10:system-NamedEntity:ntiid2',
				'tag:nextthought.com,2011-10:system-NamedEntity:ntiid3'
			];

			spyOn(UserRepository,'getUser').andCallFake(function(users, cb){
				cb.call(cb, createUserList(users));
			});
		});

		it('Calling with a published entry and a private sharedWith', function(){
			var sharedWith = {
					publicToggleOn: false,
					entities: ['a','b','c']
				},
				tags = ['taga','tagb'];

			setUpPost(tags, sharedWith, true);
			
			ctrl.handleShareAndPublishState(blogEntry, sharedWith, Ext.emptyFn);

			expect(UserRepository.getUser).not.toHaveBeenCalled();
			expect(blogEntry.publish).toHaveBeenCalled();
			expect(blogEntry.set).toHaveBeenCalledWith('sharedWith', sharedWith.entities);
			expect(blogEntry.save).toHaveBeenCalled();
			expect(blogPost.set).not.toHaveBeenCalled();
			expect(blogPost.save).not.toHaveBeenCalled();
		});

		it('Calling with a published entry and a publich sharedWith', function(){
			var sharedWith = {
				publicToggleOn: true,
				entities: ['a','b','c']
			},
			tags = ['taga','tagb'];

			setUpPost(tags, sharedWith, true);
			ctrl.handleShareAndPublishState(blogEntry, sharedWith, Ext.emptyFn);

			expect(UserRepository.getUser).toHaveBeenCalledWith(['a','b','c'], jasmine.any(Function));
			expect(blogEntry.publish).not.toHaveBeenCalled();
			expect(blogEntry.set).not.toHaveBeenCalled();
			expect(blogEntry.save).not.toHaveBeenCalled();
			expect(blogPost.set).toHaveBeenCalledWith('tags', Ext.Array.merge(sharedWith.entities, tags));
			expect(blogPost.save).toHaveBeenCalled();
		});

		it('Calling with a private entry and a private sharedWith', function(){
			var sharedWith = {
				publicToggleOn: false,
				entities: ['a','b','c']
			},
			tags = ['taga', 'tagb'];

			setUpPost(tags, sharedWith, false);
			ctrl.handleShareAndPublishState(blogEntry, sharedWith, Ext.emptyFn);

			expect(UserRepository.getUser).not.toHaveBeenCalled();
			expect(blogEntry.publish).not.toHaveBeenCalled();
			expect(blogEntry.set).toHaveBeenCalledWith('sharedWith', sharedWith.entities);
			expect(blogEntry.save).toHaveBeenCalled();
			expect(blogPost.set).not.toHaveBeenCalled();
			expect(blogPost.save).not.toHaveBeenCalled();
		});

		it('Calling with a private entry and a public sharedWith', function(){
			var sharedWith = {
				publicToggleOn: true,
				entities: ['a','b','c']
			},
			tags = ['taga','tagb'];

			setUpPost(tags, sharedWith, false);
			ctrl.handleShareAndPublishState(blogEntry, sharedWith, Ext.emptyFn);

			expect(UserRepository.getUser).toHaveBeenCalledWith(['a','b','c'], jasmine.any(Function));
			expect(blogEntry.publish).toHaveBeenCalled();
			expect(blogEntry.set).not.toHaveBeenCalled();
			expect(blogEntry.save).not.toHaveBeenCalled();
			expect(blogPost.set).toHaveBeenCalledWith('tags', Ext.Array.merge(sharedWith.entities, tags));
			expect(blogPost.save).toHaveBeenCalled();
		});
	});
});
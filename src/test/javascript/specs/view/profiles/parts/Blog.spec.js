describe('Blog Tests', function(){
	var blog, testBody, username;
	beforeEach(function(){

	});

	describe('tests app user capability', function(){
		beforeEach(function(){
			testBody = document.createElement('div');
			document.body.appendChild(testBody);

			username = $AppConfig.username;
			blog = NextThought.view.profiles.parts.Blog.create({
				username: username,
				renderTo: testBody,
				canCreateNewBlog: function(){ return true; },
				shouldShowThoughtTab: function(){return true; },
				buildBlog: function(){}
			});
			console.log('Blog: ', blog);

		});

		afterEach(function(){
			blog.destroy();
			document.body.removeChild(testBody);
		});

		it('checks if the AppUser can blog', function(){
			expect(blog.username).toEqual($AppConfig.username);
			expect(blog.renderData.canBlog).toBeTruthy();
			//If the user can blog, we expect the newBlogEntry button to exist.
			expect( blog.btnNewEntryEl).toBeTruthy();
		});
	});

	describe('checks existence of Thoughts tab based on workspace', function(){
		var destroySpy;
		beforeEach(function(){
			testBody = document.createElement('div');
			document.body.appendChild(testBody);

			destroySpy = jasmine.createSpy('destroySpy');
			jasmine.Clock.useMock();
			blog = NextThought.view.profiles.parts.Blog.create({
				username: username,
				renderTo: testBody,
				canCreateNewBlog: function(){ return true; },
				shouldShowThoughtTab: function(){return false; },
				buildBlog: function(){},
				destroy: destroySpy
			});
		});

		afterEach(function(){
			blog.destroy();
			document.body.removeChild(testBody);
		});

		//If the workspace doesn't allow blogging, we expect the tab to be destroyed.
		it('checks if thought tab was destroyed', function(){
			expect(destroySpy).not.toHaveBeenCalled();
			jasmine.Clock.tick(2);
			expect(destroySpy).toHaveBeenCalled();
		});
	});


	describe('checks existence of Thoughts tab based on blog url presence', function(){
		var destroySpy, user;
		beforeEach(function(){
			testBody = document.createElement('div');
			document.body.appendChild(testBody);

			destroySpy = jasmine.createSpy('destroySpy');
			user = Ext.create('NextThought.model.User', { alias: 'testUser2', realname: 'testUser2', Username: 'testUser2'});
			jasmine.Clock.useMock();
			blog = NextThought.view.profiles.parts.Blog.create({
				username: user.get('Username'),
				user: user,
				renderTo: testBody,
				canCreateNewBlog: function(){ return true; },
				shouldShowThoughtTab: function(){return true; },
				destroy: destroySpy
			});

		});

		afterEach(function(){
			blog.destroy();
			document.body.removeChild(testBody);
		});

		//Since, we're not the AppUser, if the url isn't there, we expect the thought tab to be destroyed.
		it('checks if thought tab was destroyed', function(){
			expect(blog.username).not.toEqual($AppConfig.username);
			expect(user.getLink('Blog')).toBeFalsy();

			expect(destroySpy).not.toHaveBeenCalled();
			jasmine.Clock.tick(2);
			expect(destroySpy).toHaveBeenCalled();
		});
	});



});

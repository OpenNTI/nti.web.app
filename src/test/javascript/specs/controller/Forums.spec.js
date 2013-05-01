describe('Forums Controller Tests', function(){

	var controller, mockObjects, navController, oldViewPort;

	beforeEach(function(){
		controller = app.getController('Forums');
		navController = app.getController('Navigation');
		oldViewPort = navController.viewport;
		navController.viewport = { activateView: Ext.emptyFn};

		mockObjects = {
			'communityBoard1': Ext.create('NextThought.model.forums.CommunityBoard', {
				NTIID: 'communityBoard1'
			}),

			'communityTopic1': Ext.create('NextThought.model.forums.CommunityHeadlineTopic', {
				NTIID: 'communityTopic1'
			}),
			'book1': Ext.create('NextThought.model.PageInfo', {
				NTIID: 'book1'
			})
		};
	});

	afterEach(function(){
		navController.viewport = oldViewPort;
	});

	describe('Test navigateToForumContent', function(){
		it('Expects going to the Board \'communityBoard1\'', function(){
			spyOn(controller, 'navigateToForumContent').andCallThrough();
			spyOn(controller, 'presentTopic');
			controller.navigateToForumContent(mockObjects['communityBoard1']);
			expect(controller.navigateToForumContent).toHaveBeenCalledWith(mockObjects['communityBoard1']);
			expect(controller.presentTopic).toHaveBeenCalledWith(mockObjects['communityBoard1']);
		});

		it('Expects going to the Topic \'communityTopic1\'', function(){
			spyOn(controller, 'navigateToForumContent').andCallThrough();
			spyOn(controller, 'presentTopic');
			controller.navigateToForumContent(mockObjects['communityTopic1']);
			expect(controller.navigateToForumContent).toHaveBeenCalledWith(mockObjects['communityTopic1']);
			expect(controller.presentTopic).toHaveBeenCalledWith(mockObjects['communityTopic1']);
		});

		it('Expects to not go to the content \'book1\'', function(){
			spyOn(controller, 'navigateToForumContent').andCallThrough();
			spyOn(controller, 'presentTopic');
			controller.navigateToForumContent(mockObjects['book1']);
			expect(controller.navigateToForumContent).toHaveBeenCalledWith(mockObjects['book1']);
			expect(controller.presentTopic).not.toHaveBeenCalled();
		});
	});

	describe('Test Loading', function(){
		var root, restore, fakeServer;

		function mockAjax (){
			var server = {args: arguments};
			spyOn(controller, 'loadRootRequest').andCallFake(function(urls,communities,success,failure,scope){
				server.doRequest = function(){
					Ext.callback(success,controller,server.args);
				}
			});

			return server;
		}

		beforeEach(function(){
			spyOn(controller,'fireEvent').andCallThrough();
			spyOn(controller,'handleRestoreState');
			spyOn(controller,'on').andCallThrough();
			spyOn($AppConfig.userObject,"getCommunities").andReturn([{
				getLink : function(){
					return 'google.com';
				}
			}])
			root = { add: function(){}};
			restore = { forums: 'forums'};
			fakeServer = mockAjax({},{});
		});

		it('callback before restoreState',function(){
			controller.loadRoot(root);
			expect(controller.loadingRoot).toBeTruthy();
			fakeServer.doRequest();
			expect(controller.loadingRoot).toBeFalsy();
			expect(controller.fireEvent).toHaveBeenCalledWith("root-loaded");
			expect(controller.handleRestoreState).not.toHaveBeenCalled();
			controller.restoreState(restore);
			expect(controller.handleRestoreState).toHaveBeenCalled();
		});
		
		it('callback after restoreState',function(){
			controller.loadRoot(root);
			controller.restoreState(restore);
			expect(controller.loadingRoot).toBeTruthy();
			expect(controller.handleRestoreState).not.toHaveBeenCalled();
			expect(controller.on).toHaveBeenCalledWith('root-loaded',jasmine.any(Function),jasmine.any(Object),jasmine.any(Object));
			fakeServer.doRequest();
			expect(controller.loadingRoot).toBeFalsy();
			expect(controller.fireEvent).toHaveBeenCalledWith('root-loaded');
			expect(controller.handleRestoreState).toHaveBeenCalled();
		});

	});
});

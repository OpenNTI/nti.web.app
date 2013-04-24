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
});

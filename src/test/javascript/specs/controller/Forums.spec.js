describe('Forums Controller Tests', function(){

	var controller, mockObjects;

	beforeEach(function(){
		controller = app.getController('Forums');

		mockObjects = {
			'communityBoard1': Ext.create('NextThought.model.forums.CommunityBoard', {
				NTIID: 'communityBoard1'
			}),

			'communityTopic1': Ext.create('NextThought.model.forums.CommunityHeadlineTopic', {
				NTIID: 'communityTopic1'
			})
		};
	});

	describe('Test navigateToForumContent', function(){
		it('Expects going to the Board \'communityBoard1\'', function(){
			spyOn(controller, 'navigateToForumContent').andCallThrough();
			controller.navigateToForumContent(mockObjects['communityBoard1']);
			expect(controller.navigateToForumContent).toHaveBeenCalledWith(mockObjects['communityBoard1']);
		});

		it('Expects going to the Topic \'communityTopic1\'', function(){
			spyOn(controller, 'navigateToForumContent').andCallThrough();
			controller.navigateToForumContent(mockObjects['communityTopic1']);
			expect(controller.navigateToForumContent).toHaveBeenCalledWith(mockObjects['communityTopic1']);
		});
	});
});

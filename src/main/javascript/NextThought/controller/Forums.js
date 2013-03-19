Ext.define('NextThought.controller.Forums', {
	extend: 'Ext.app.Controller',

	models: [
		'forums.Board',
		'forums.CommunityForum',
		'forums.CommunityHeadlineTopic',
		'forums.Forum',
		'forums.GeneralForum',
		'forums.GeneralForumComment',
		'forums.GeneralHeadlinePost',
		'forums.GeneralHeadlineTopic',
		'forums.GeneralPost',
		'forums.GeneralTopic',
		'forums.HeadlinePost',
		'forums.HeadlineTopic',
		'forums.Post',
		'forums.Topic'
	],

	stores: [
		//'Board','Forums'...
	],

	views: [
		'forums.Board',
		'forums.Forum',
		'forums.ForumListItem',
		'forums.Topic',
		'forums.TopicListItem',
		'forums.View'
	],

	refs: [],

	init: function() {

		this.control({
			'forums-board': {
				'afterrender':this.loadBoards
			}
		});
	},



	loadBoards: function(boardCmp){
		function makeUrl(c){
			return c === 'Everyone' ? null
					: getURL([$AppConfig.server.data, 'users/', c, '/Forum'].join('')); }

		var urls = Ext.Array.map($AppConfig.userObject.get('Communities'),makeUrl);

		Ext.each(urls,function(u){
			if(!u){return;}

//			Ext.Ajax.request({
//				url: u, method: 'POST',
//				jsonData: {'Class':'Post',title: 'Foobar', body:['baz']}
//			});

			Ext.Ajax.request({ url:u });
		})
	}


	/**
	 * This module will implement its navigation as a stack.  Both in tracking, and in literal view placement.
	 */
});

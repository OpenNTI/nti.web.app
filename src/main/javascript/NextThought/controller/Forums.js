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
		'NTI'
		//'Board','Forums'...
	],

	views: [
		'forums.Board',
		'forums.Forum',
		'forums.Topic',
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

		//Just for now...
		function fn(resp){
			forums.push.apply(forums, ParseUtils.parseItems(resp.responseText));
			maybeFinish();
		}

		function maybeFinish(){
			urls.handled--;
			if(urls.handled === 0){
				console.log('List of forums:',forums);
				//add forums to a Board Store.
				//Set the store on the boardCmp
				store.add(forums);
			}
		}

		var urls = Ext.Array.map($AppConfig.userObject.get('Communities'),makeUrl),
			forums = [],
			store = NextThought.store.NTI.create({
				model: 'NextThought.model.forums.Forum', id:'flattened-boards-forums'
			});

		urls.handled = urls.length;

		boardCmp.bindStore(store);

		Ext.each(urls,function(u){

			if(!u){ maybeFinish(); return; }

			/*
			//Adds a test post
			Ext.Ajax.request({
				url: u, method: 'POST',
				jsonData: {'Class':'Post',title: 'Foobar', body:['baz']}
			}); */

			Ext.Ajax.request({ url:u, success: fn, failure: maybeFinish });
		})
	}


	/**
	 * This module will implement its navigation as a stack.  Both in tracking, and in literal view placement.
	 */
});

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

	refs: [
		{ ref: 'forumViewContainer', selector: 'forums-view-container#forums'}
	],


	init: function() {

		this.control({
			'forums-board': {
				'afterrender':this.loadBoards,
				'select':this.loadForum
			}
		});
	},



	loadBoards: function(boardCmp){
		function makeUrl(c){ return c && c.getLink('Forum'); }

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
				store.add(forums);
			}
		}
		var urls, forums = [],
			store = NextThought.store.NTI.create({
				model: 'NextThought.model.forums.Forum', id:'flattened-boards-forums'
			});


		UserRepository.getUser($AppConfig.userObject.get('Communities'),function(u){

			urls = Ext.Array.map(u,makeUrl);
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
			});

		});
	},


	loadForum: function(selModel, record){
		if( Ext.isArray(record) ){ record = record[0]; }
		var c = this.getForumViewContainer();

//		console.log(c, record);
		c.add({xtype: 'forums-topic-list'});

	}


});

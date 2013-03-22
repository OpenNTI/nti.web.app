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
		function fn(resp,req){
			var o = ParseUtils.parseItems(resp.responseText);
			if(req && req.community){
				Ext.each(o,function(o){
					o.set('Creator',req.community);
				});
			}
			forums.push.apply(forums, o);
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

		var communities,
			urls, forums = [],
			store = NextThought.store.NTI.create({
				model: 'NextThought.model.forums.Forum', id:'flattened-boards-forums'
			});


		communities = $AppConfig.userObject.getCommunities();

		urls = Ext.Array.map(communities,makeUrl);
		urls.handled = urls.length;

		boardCmp.bindStore(store);

		Ext.each(urls,function(url,i){

			if(!url){ maybeFinish(); return; }

			/*
			//Adds a test post
			Ext.Ajax.request({
				url: u, method: 'POST',
				jsonData: {'Class':'Post',title: 'Foobar', body:['baz']}
			}); */

			Ext.Ajax.request({ url:url, community: communities[i], success: fn, failure: maybeFinish });
		});

	},


	loadForum: function(selModel, record){
		if( Ext.isArray(record) ){ record = record[0]; }
		var c = this.getForumViewContainer(),
			url = record.getLink('contents'),
			store;


		store = NextThought.store.NTI.create({ storeId: 'forum-'+record.getId(), url:url, autoLoad:true });
		c.add({xtype: 'forums-topic-list', record: record, store: store});
	}
});

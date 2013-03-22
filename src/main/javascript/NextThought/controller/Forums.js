Ext.define('NextThought.controller.Forums', {
	extend: 'Ext.app.Controller',

	models: [
		'forums.Board',
		'forums.CommunityBoard',
		'forums.CommunityForum',
		'forums.CommunityHeadlinePost',
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
		'forums.Root',
		'forums.Board',
		'forums.Comment',
		'forums.Forum',
		'forums.Topic',
		'forums.View'
	],

	refs: [
		{ ref: 'forumViewContainer', selector: 'forums-view-container#forums'}
	],


	init: function() {

		this.control({
			'forums-view-container':{
				'restore-forum-state': this.restoreState,
				'render': this.loadRoot
			},
			'forums-root': {
				'select': this.loadBoard
			},
			'forums-board': {
				'select':this.loadForum
			},
			'forums-forum': {
				'new-topic':this.newTopic,
				'select':this.loadTopic
			}
		});
	},


	restoreState: function(state){
		var c = this.getForumViewContainer();
		console.log('Handle restore of state here', state);
		if(c){
			c.fireEvent('finished-restore');
		}
		else{
			//Ruh roh
			console.error('No forum container to fire finish restoring.  Expect problems', this);
		}
	},


	pushState: function(s){
		s = {'forums': s};
		console.log('Need to push updated state here', s);
	},


	showLevel: function(level, record, pushState){
		var c = this.getForumViewContainer(),
			url = record.getLink('contents'),
			store;


		store = NextThought.store.NTI.create({ storeId: record.get('Class')+'-'+record.getId(), url:url, autoLoad:true });
		//Because the View is tied to the store and its events, any change to
		// records trigger a refresh. :)  So we don't have to impl. any special logic filling in. Just replace the
		// Creator string with the user model and presto!
		store.on('load',this.fillInUsers,this);
		c.add({xtype: 'forums-'+level+'-list', record: record, store: store});


	},


	loadRoot: function(view){
		function makeUrl(c){ return c && c.getLink('DiscussionBoard'); }

		//Just for now...
		function fn(resp,req){
			var o = ParseUtils.parseItems(resp.responseText),
				c;

			if(req && req.community) {
				c = req.community;
				Ext.each(o,function(o){
					if(o.get('Creator') === c.getId()){ o.set('Creator',c); }});
			}

			boards.push.apply(boards, o);
			maybeFinish();
		}

		function maybeFinish(){
			urls.handled--;
			if(urls.handled === 0){
				console.log('List of boards:',boards);
				store.add(boards);
			}
		}

		var communities = $AppConfig.userObject.getCommunities(),
			urls = Ext.Array.map(communities,makeUrl),
			boards = [],
			store = NextThought.store.NTI.create({
				model: 'NextThought.model.forums.Forum', id:'flattened-boards-forums'
			});


		urls.handled = urls.length;

		view.add({store:store, xtype: 'forums-root'});

		Ext.each(urls,function(url,i){

			if(!url){ maybeFinish(); return; }

			Ext.Ajax.request({ url:url, community: communities[i], success: fn, failure: maybeFinish });
		});
	},


	loadBoard: function(selModel, record){
		var community;
		if( Ext.isArray(record) ){ record = record[0]; }
		this.showLevel('forum', record);
		community = record.get('Creator');
		if(community.isModel){
			community = community.get('Username');
		}
		this.pushState({'board': community}); //The communities board we are viewing
	},


	loadForum: function(selModel, record){
		if( Ext.isArray(record) ){ record = record[0]; }
		this.showLevel('topic', record);
		this.pushState({'forum': record.get('ID')}); //The forum we are viewing
	},


	fillInUsers: function(store, records){
		var users = Ext.Array.map(records,function(r){return r.get('Creator');});

		function apply(r,i){
			var u = users[i],
				id = u.getId(),
				c = r.get('Creator');

			if(c !== id && !Ext.isString(c) && c && c.getId() !== id){
				console.error('Bad mapping:', c, id, records, users, i);
				return;
			}

			if(c && !c.isModel){
				r.set('Creator',u);
			}
		}

		UserRepository.getUser(users,function(u){
			users = u;

			store.suspendEvents(true);
			Ext.each(records,apply);
			store.resumeEvents();

		});
	},


	newTopic: function(cmp, forumRecord){
		var c = this.getForumViewContainer().add({xtype:'box', html: 'Put editor here'});
		Ext.defer(c.destroy,5000,c);
		console.log('New Topic! Show editor :)');
	},


	loadTopic: function(selModel, record){
		if( Ext.isArray(record) ){ record = record[0]; }
		var c = this.getForumViewContainer(),
			o = c.items.last();

		if(o && !o.getPath) { o = null; }

		c.add({xtype: 'forums-topic', record: record, path: o && o.getPath()});
		this.pushState({'topic': record.get('ID')});
	}
});

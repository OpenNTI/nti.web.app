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
		'forums.Editor',
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
			},
			'forums-topic': {
				'delete-post': this.deleteObject
			},
			'forums-topic-editor':{
				'save-post': this.saveTopicPost
			},
			'forums-topic-comment':{
				'delete-topic-comment': this.deleteObject
			},
			'forums-topic nti-editor': {
				'save': this.saveTopicComment
			}
		});
	},


	restoreState: function(s){
		var c = this.getForumViewContainer(),
			state = s.forums || {};

		console.log('Handle restore of state here', state);
		//this.popToLastKnownMatchingState(state);
		//this.pushKnownState(state);

		if(c){
			c.fireEvent('finished-restore');
		}
		else{
			//Ruh roh
			console.error('No forum container to fire finish restoring.  Expect problems', this);
		}
	},


/*	doesViewMatchState: function(v, key, val){
		var vVal;
		if(!v.record || v.stateKey !== key){
			return false;
		}

		vVal = v.record.get('ID');
		if(key === 'board'){
			vVal = v.record.get('Creator');
			if(vVal.isModel){
				vVal.get('Username');
			}
		}

		return vVal === val.ID;
	},


	pushKnownState: function(state){
		var c = this.getForumViewContainer(),
			item = c.peek(),
			i = item.stateKey ? this.stackOrder.indexOf(item.stateKey) : -1,
			toLoad = [];

		if(i < 0){
			return;
		}

		for(i = i + 1; i < this.stackOrder.length; i++){
			if(!state[this.stackOrder[i]]){
				break;
			}
			toLoad.push(state[this.stackOrder[i]]);
			item = c.peek();
		}

		console.log('Need to push', toLoad);
	},


	popToLastKnownMatchingState: function(state){
		var c = this.getForumViewContainer(),
			lastKnownMatcher, part; //Skip the root element

		if(c.items.getCount() === 0){
			return;
		}

		lastKnownMatcher = c.items.getAt(0);

		for(i=1; i<c.items.getCount(); i++){
			item = c.items.getAt(i);
			part = this.stackOrder[i];
			if(!part || !state[part] || this.doesViewMatchState(item, part, state[part])){
				break;
			}
			lastKnownMatcher = item;
		}

		while(c.peek() !== lastKnownMatcher){
			c.popView();
		}
	},*/


	pushState: function(s){
		s = {'forums': s};
		console.log('Need to push updated state here', s);
		history.pushState(s);
	},

	showLevel: function(level, record, cfg){
		var c = this.getForumViewContainer(),
			url = record.getLink('contents'),
			store, cmpCfg;


		store = NextThought.store.NTI.create({ storeId: record.get('Class')+'-'+record.get('ID'), url:url, autoLoad:true });
		//Because the View is tied to the store and its events, any change to
		// records trigger a refresh. :)  So we don't have to impl. any special logic filling in. Just replace the
		// Creator string with the user model and presto!
		store.on('load',this.fillInUsers,this);
		cmpCfg = Ext.applyIf({xtype: 'forums-'+level+'-list', record: record, store: store}, cfg || {});
		c.add(cmpCfg);
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

		view.add({store:store, xtype: 'forums-root', stateKey: 'root'});

		Ext.each(urls,function(url,i){

			if(!url){ maybeFinish(); return; }

			Ext.Ajax.request({ url:url, community: communities[i], success: fn, failure: maybeFinish });
		});
	},


	loadBoard: function(selModel, record){
		var community;
		if( Ext.isArray(record) ){ record = record[0]; }
		this.showLevel('forum', record, {stateKey: 'community'});

		community = record.get('Creator');
		if(community.isModel){
			community = community.get('Username');
		}
		this.pushState({community: community, 'isUser': true}); //The communities board we are viewing
	},


	loadForum: function(selModel, record){
		if( Ext.isArray(record) ){ record = record[0]; }
		this.showLevel('topic', record, {stateKey: 'forum'});
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


	saveTopicComment: function(editor,record,valueObject){

		var postCmp = editor.up('forums-topic'),
			postRecord = postCmp && postCmp.record,
			isEdit = Boolean(record),
			commentForum = record || NextThought.model.forums.GeneralForumComment.create();

		commentForum.set({ body:valueObject.body });

		if(editor.el){
			editor.el.mask('Saving...');
			editor.el.repaint();
		}

		function unmask(){
			if(editor.el){
				editor.el.unmask();
			}
		}

		try{

			commentForum.save({
				url: isEdit ? undefined : postRecord && postRecord.get('href'),//only use postRecord if its a new post.
				scope: this,
				success: function(rec){
					console.log('Success: ', rec);
					unmask();
					if(postCmp.store && !postCmp.isDestroyed){
						if(!isEdit){
							postCmp.store.insert(0,rec);
						}
						editor.deactivate();
						editor.setValue('');
						editor.reset();
					}
					//TODO: increment PostCount in postRecord the same way we increment reply count in notes.
					if(!isEdit){
						postRecord.set('PostCount',postRecord.get('PostCount')+1);
					}
				},
				failure: function(){
					console.log('Failed: ', arguments);
					editor.markError(editor.getEl(),'Could not save comment');
					unmask();
					console.debug('failure',arguments);
				}
			});

		}
		catch(e){
			console.error('An error occurred saving comment', Globals.getError(e));
			unmask();
		}

	},


	newTopic: function(cmp, forumRecord){
		this.getForumViewContainer().add({xtype:'forums-topic-editor'});
	},


	loadTopic: function(selModel, record){
		if( Ext.isArray(record) ){ record = record[0]; }
		var c = this.getForumViewContainer(),
			o = c.items.last();

		if(o && !o.getPath) { o = null; }

		c.add({xtype: 'forums-topic', record: record, path: o && o.getPath(), stateKey: 'topic'});
		this.pushState({'topic': record.get('ID')});
	},


	saveTopicPost: function(editorCmp, record, title, tags, body){

		var isEdit = Boolean(record),
			cmp = editorCmp.prev(),
			post = isEdit ? record.get('headline') : NextThought.model.forums.CommunityHeadlinePost.create(),
			forumRecord = cmp && cmp.record;

		post.set({
			'title':title,
			'body':body,
			'tags':tags||[]
		});

		if(isEdit){
			record.set({'title': title});
		}

		function finish(entry){
			if(!isEdit){
				try {
					if(cmp.store){
						cmp.store.insert(0,entry);
					}
				}
				catch(e){
					console.error('Could not insert post into widget',Globals.getError(e));
				}
			}

			Ext.callback(editorCmp.onSaveSuccess,editorCmp,[]);
		}

		if(editorCmp.el){
			editorCmp.el.mask('Saving...');
		}

		function unmask(){
			if(editorCmp.el){
				editorCmp.el.unmask();
			}
		}

		try{
			post.save({
				url: isEdit ? undefined : forumRecord && forumRecord.get('href'),//only use postRecord if its a new post.
				scope: this,
				success: function(post,operation){

					var entry = isEdit? record : ParseUtils.parseItems(operation.response.responseText)[0];

					unmask();
					finish(entry);
				},
				failure: function(){
					console.debug('failure',arguments);
					unmask();
					Ext.callback(editorCmp.onSaveFailure,editorCmp,arguments);
				}
			});
		}
		catch(e){
			console.error('An error occurred saving blog', Globals.getError(e));
			unmask();
		}
	},


	deleteObject: function(record){
		var idToDestroy;
		if(!record.get('href')){
			record.set('href',record.getLink('contents').replace(/\/contents$/,'')||'no-luck');
		}
		idToDestroy = record.get('NTIID');
		record.destroy({
			success:function(){
				LocationProvider.applyToStoresThatWantItem(function(id,store){
					var r;
					if(store){
						r = store.findRecord('NTIID',idToDestroy,0,false,true,true);
						if(!r){
							console.warn('Could not remove, the store did not have item with id: '+idToDestroy, r);
							return;
						}

						//The store will handle making it a placeholder if it needs and fire events,etc... this is all we need to do.
						store.remove(r);
					}
				}, record);
			},
			failure: function(){
				alert('Sorry, could not delete that');
			}
		});
	}
});

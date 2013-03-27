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

			'forums-view-container > *':{
				'pop-view': this.popView
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
			},
			'search-result':{
				'click-forum-comment': this.showForumSearchResult,
				'click-forum-result': this.showForumSearchResult
			},
			'*': {
				'show-topic': this.presentTopic
			}
		});
	},


	stateKeyPrecedence: ['board','forum','topic','comment'],


	restoreState: function(s){
		var c = this.getForumViewContainer(),
			state = s.forums || {};

		console.log('Handle restore of state here', state);
		this.popToLastKnownMatchingState(state);
		this.pushKnownState(state);

		if(c){
			c.fireEvent('finished-restore');
		}
		else{
			//Ruh roh
			console.error('No forum container to fire finish restoring.  Expect problems', this);
		}
	},


	doesViewMatchState: function(v, key, val){
		var vVal;
		if(!v.record || v.stateKey !== key){
			return false;
		}

		vVal = v.record.get('ID');

		function equals(a,b){
			return a.community === b.community
				&& a.isUser === b.isUser;
		}

		if(Ext.isObject(val) && val.isUser){
			vVal = v.record.get('Creator');
			if(vVal.isModel){
				vVal = vVal.get('Username');
			}
			vVal = {
				isUser: true,
				community: vVal
			};
		}

		return Ext.isObject(vVal) ? equals(vVal,val) : vVal === val;
	},


	pushKnownState: function(state){
		var c = this.getForumViewContainer(),
			community = state && state.board && state.board.community,
			stackOrder = this.stateKeyPrecedence,
			stateKey = (c.peek()||{}).stateKey,
			i = stackOrder.indexOf(stateKey),
			toLoad = [],
			me = this;

		function getBaseUrl(rec){
			var base = rec && rec.get('href');

			if(!base && stateKey !== 'root'){
				return null;
			}

			if(!base && community){
				Ext.each($AppConfig.userObject.getCommunities(),function(r){
					if(r.get('Username') === community){
						base = r.getLink('DiscussionBoard');
						return false;
					}
					return true;
				});
			}

			return base;
		}


		if(i < 0 && stateKey !== 'root'){
			return;
		}

		for(i = i + 1; i < stackOrder.length; i++){
			if(!state[stackOrder[i]]){
				break;
			}

			toLoad.push([stackOrder[i],state[stackOrder[i]]]);
		}

		if(Ext.isEmpty(toLoad)){
			return;
		}

		this.pushViews(getBaseUrl(c.peek().record),toLoad, null, null, true);
	},


	pushNecessaryViews: function(record, cb, scope){
		var c = this.getForumViewContainer(),
			stackOrder = this.stateKeyPrecedence,
			showingStateKey = (c.peek() || {}).stateKey,
			recordType = 'topic',
			href = record.get('href'),
			i, toLoad = [], parts = [], base, pieces,
			state = {},
			me = this;

		//First order of business is to figure out the base url
		//followed by the ids that need to load.  Unlike state we work
		//backwards here.  We also assume our record is topic
		//this may need to change breifly for comments but it is a start

		//The idea here is to pop pieces off the end of the href we want to show
		//collecting ids for each of the views between where we are and where we are going
		//Stop when we run out of parts to show or we get to something that looks
		//like the top view
		i = stackOrder.indexOf(recordType);
		pieces = href.split('/');
		for(i; i>=0; i--){
			if(showingStateKey === stackOrder[i]){
				break;
			}
			if(Ext.isEmpty(pieces)){
				Ext.callback(cb, scope, [false]);
				return;
			}
			parts.unshift(pieces.pop());
		}
		base = pieces.join('/');


		console.log('Show from', base, 'Parts ', parts);

		i = stackOrder.indexOf(recordType);
		Ext.Array.each(parts, function(part){
			toLoad.unshift([stackOrder[i], part]);
			i--;
		}, this, true);

		if(Ext.isEmpty(toLoad)){
			Ext.callback(cb, scope, [true]);
			return;
		}

		//Ok we have built up what we need to show.Show it
		this.pushViews(base, toLoad, cb, scope);

	},


	//Fetch all the needed records
	//and start pushing views.  Note we do this silently so state does not get updated
	//in many chunks.  We gather state as it is needed and push it once at
	//the end if requested.  This keeps back and forward (at least within this function) working
	//like you would expect.  There are still issues with state not being transactional
	//with the action the user expects.  For instance coming from another tab has
	//a state change for the tab showing and then our state change.  We should
	//fix that.
	pushViews: function(base, toLoad, cb, scope, silent){
		var stackOrder = this.stateKeyPrecedence,
			state = {},
			me = this;

		function stateForKey(key, rec){
			var community;
			if(key === 'board'){
				community = rec.get('Creator');
				if(community.isModel){
					community = rec.get('Username');
				}
				return {isUser: true, community: community};
			}
			return rec.get('ID');
		}

		console.log('Need to push views. Base', base, 'toLoad', toLoad);

		this.getRecords(base, toLoad, function(records){
			var j = stackOrder.indexOf(records.first()[0]);
			Ext.each(records,function(pair){
				var rec = pair.last(),
					type = Ext.String.capitalize(pair.first());

				if(!rec){
					//Error callback here?
					return false;
				}

				me['load'+type](null,rec,true);
				state[pair[0]] = stateForKey(pair[0], pair[1]);
				j++;

				return true;
			});

			for(j;j<stackOrder.length;j++){
				state[stackOrder[j]] = null;
			}

			//Push state if not requested to be silent
			if(silent !== true){
				this.pushState(state);
			}

			//callback
			Ext.callback(cb, scope, [true]);
		});
	},


	getRecords: function(base, ids, callback){
		var href = getURL(base),
			finish = ids.length,
			me = this;


		if(!base){
			if( ids[0] ){
				ids[0][1] = null;
			}
			Ext.callback(callback,me,[ids]);
			return;
		}

		function maybeFinish(){
			finish--;
			if(finish===0){
				Ext.callback(callback,me,[ids]);
			}
		}

		Ext.each(ids,function(pair){

			//Only "board" level will have a non-string. And its already accounted for in the base.
			href += (!Ext.isString(pair[1]) ? '' : '/'+pair[1]);

			var r = {
				url: href,
				callback: function(req,s,resp){
					try {
						pair[1] = ParseUtils.parseItems(resp.responseText)[0];
					}
					catch(e){
						pair[1] = null;
						console.error('Could not load record',Globals.getError(e));
					}
					maybeFinish();
				}
			};

			Ext.Ajax.request(r);
		});
	},


	popToLastKnownMatchingState: function(state){
		var me = this;
		function predicate(item, i){
			var part = me.stateKeyPrecedence[i-1];
			return part && state[part] && me.doesViewMatchState(item, part, state[part]);
		}

		this.popToLastViewMatchingPredicate(predicate);
	},


	popToLastViewMatchingPredicate: function(predicate){
		var c = this.getForumViewContainer(), i, item,
			lastKnownMatcher, part; //Skip the root element

		if(c.items.getCount() <= 1 || !Ext.isFunction(predicate)){
			return;
		}

		lastKnownMatcher = c.items.getAt(0);

		for(i=1; i<c.items.getCount(); i++){
			item = c.items.getAt(i);
			if(!predicate(item, i)){
				break;
			}
			lastKnownMatcher = item;
		}

		while(c.peek() !== lastKnownMatcher){
			c.popView();
		}
	},


	popView: function(view){
		var stack = view.ownerCt,
			keyIx = Ext.Array.indexOf(this.stateKeyPrecedence,view.stateKey),
			state = {};

		//assert that the view is the top of the stack
		if(stack.peek() !== view){
			console.error('View was not at the top of stack when it requested to pop.', view);
			return false;
		}

		try {
			stack.popView();//this should destroy view for us, but just in case...
			if(!view.isDestroyed){
				view.destroy();
			}

			for(keyIx; keyIx>=0 && keyIx<this.stateKeyPrecedence.length; keyIx++){
				state[this.stateKeyPrecedence[keyIx]] = null;
			}

			this.pushState(state);

		} catch(e) {
			console.warn(Globals.getError(e));
		}

		return true;
	},


	pushState: function(s){
		s = {'forums': s};
		console.log('Need to push updated state here', s);
		history.pushState(s);
	},


	presentTopic: function(record, cb, scope, eOpts){
		var callback = Ext.isFunction(cb) ? cb : undefined,
			toShowHref = record ? record.get('href') : null;

		if(!record || !toShowHref){
			Ext.callback(callback, scope, [false]);
			return;
		}

		console.log('should navigate to forum topic: ', record, callback);

		//The idea here is similar to state restoration.  Pop us down to the last
		//stack view that matches (which is worst case the root).  Then using the
		//href on the passed record build record hrefs that we need, fetch them,
		//and then build the necessary stores.

		//First we pop down the first view whose records href is a prefix of ours
		//or the root
		function predicate(item, i){
			var rec = item.record,
				href = rec.get('href');
			return rec && href && toShowHref.indexOf(href) === 0;
		}

		this.popToLastViewMatchingPredicate(predicate);
		this.pushNecessaryViews(record, cb, scope);
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


	loadBoard: function(selModel, record, silent){
		var community;
		if( Ext.isArray(record) ){ record = record[0]; }
		this.showLevel('forum', record, {stateKey: 'board'});

		community = record.get('Creator');
		if(community.isModel){
			community = community.get('Username');
		}
		if(silent !== true){
			//The communities board we are viewing
			this.pushState({board:{community: community,isUser: true}, forum: null, topic: null, comment: null});
		}
	},


	loadForum: function(selModel, record, silent){
		if( Ext.isArray(record) ){ record = record[0]; }
		this.showLevel('topic', record, {stateKey: 'forum'});
		if(silent !== true){
			this.pushState({'forum': record.get('ID'), topic: null, comment: null}); //The forum we are viewing
		}
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


	loadTopic: function(selModel, record, silent){
		if( Ext.isArray(record) ){ record = record[0]; }
		var c = this.getForumViewContainer(),
			o = c.items.last();

		if(o && !o.getPath) { o = null; }

		c.add({xtype: 'forums-topic', record: record, path: o && o.getPath(), stateKey: 'topic'});

		if(silent !== true){
			this.pushState({'topic': record.get('ID'), comment: null});
		}
	},


	saveTopicPost: function(editorCmp, record, title, tags, body, autoPublish){

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
					if(autoPublish !== undefined){
						if(autoPublish !== entry.isPublished()){
							entry.publish(editorCmp,finish,this);
							return;
						}
					}

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
	},

	//Search functions
	showForumSearchResult: function(result, fragIdx){
		var r = result.record;
		this.presentTopic(r, function(success){
			console.log('Do search highlighting here.');
		}, this);
	}
});

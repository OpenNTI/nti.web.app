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

		this.listen({
			component:{
				'forums-view-container':{
					'restore-forum-state': this.restoreState,
					'render': this.loadRoot
				},

				'forums-view-container > *':{
					'pop-view': this.popView
				},

				'course-forum > *':{
					'pop-view': this.popView
				},

				'forums-root': {
					'select': this.loadBoard
				},
				'forums-board': {
					'select':this.loadForum
				},
				'forums-forum': {
					'new-topic':this.showTopicEditor,
					'select':this.loadTopic
				},
				'forums-topic': {
					'navigate-topic':this.switchTopic,
					'delete-post': this.deleteObject,
					'edit-topic':this.showTopicEditor,
					'topic-navigation-store': this.enableTopicNavigation
				},
				'forums-topic-editor':{
					'save-post': this.saveTopicPost
				},
				'forums-topic-comment':{
					'delete-topic-comment': this.deleteObject
				},
				'activity-preview-topic':{
					'fill-in-path': this.fillInPath
				},
				'activity-preview-topic > nti-editor': {
					'save': this.saveTopicComment
				},
				'activity-preview-topic-reply > nti-editor':{
					'save': this.saveTopicComment
				},
				'profile-forum-activity-item':{
					'delete-post': this.deleteObject,
					'fill-in-path': this.fillInPath
				},
				'activity-preview-topic-reply':{
					'delete-topic-comment': this.deleteObject
				},
				'profile-forum-activity-item nti-editor':{
					'save': this.saveTopicComment
				},
				'#forums > forums-topic nti-editor': {
					'save': this.saveTopicComment
				},

				'#content > course-forum nti-editor':{
					'save': this.saveTopicComment
				},

				'search-result':{
					'highlight-topic-hit': this.highlightSearchResult
				},
				'*': {
					'show-topic': this.presentTopic
				}
			},
			controller:{
				'*': {
					'show-object': this.navigateToForumContent
				}
			}
		});
	},


	getStackContainer: function(ref){
		var view;
		//'[isStackContainer]'
		if(!ref){
			return this.getForumViewContainer();
		}

		view = ref.view || ref;

		return view.up('[isStackContainer]');
	},


	fillInPath: function(cmp, record, callback){
		var i = 0,
			parts = [],
			r = record,
			href = r.get('href').split('/');

		for(i;i<2;i++){
			href.pop();
			parts.unshift(getURL(href.join('/')));
		}


		function maybeFinish(){
			i--;
			if(i>0){ return; }

			Ext.callback(callback,cmp,[parts]);
		}

		function getObject(url,ix){
			var req = {
				url: url,
				success: function(rep){
					var o = parts[ix] = ParseUtils.parseItems(rep.responseText)[0];
					if(!/board$|forum$/i.test(o.get('Class'))){
						console.error('Unexpected object: ', o, ' from: ',url, 'and: ', r.get('href'));
						parts[ix] = null;
						return;
					}

					UserRepository.getUser(o.get('Creator'),function(u){
						o.set('Creator',u);
						maybeFinish();
					});
				},
				failure: function(){
					console.error('Could not load part: '+url, ' from: ',r.get('href'));
					parts[ix] = null;
					maybeFinish();
				}
			};

			Ext.Ajax.request(req);
		}

		Ext.each(parts,getObject);
	},


	//An array denoting the precedence of data in state
	stateKeyPrecedence: ['board','forum','topic','comment'],


	handleRestoreState: function(state, c){
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


	restoreState: function(s){
		var c = this.getForumViewContainer(),
			state = s.forums || {},
			me = this;

		function handle(){
			me.handleRestoreState(state,c);
		}
		
		//make sure loadRoot has finished
		if(me.loadingRoot){
			me.on('root-loaded',handle,me,{single: true});
		}else{
			handle();
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

		this.pushViews(getBaseUrl(c.peek().record),toLoad, null, null, true);
	},


	pushNecessaryViews: function(href, recordType, cb, scope){
		var c = this.getForumViewContainer(),
			stackOrder = this.stateKeyPrecedence,
			showingStateKey = (c.peek() || {}).stateKey,
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
			comment,
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

		if(toLoad.last() && toLoad.last()[0] === 'comment'){
			comment = toLoad.pop();
		}

		this.getRecords(base, toLoad, function(records){
			var j =  records.first() ? (stackOrder.indexOf(records.first()[0])) : (stackOrder.length - 1),
				maybeTopic, shouldFireCallBack = true;
			Ext.each(records,function(pair, index, allItems){
				var rec = pair.last(),
					type = Ext.String.capitalize(pair.first()),
					f = me.getForumViewContainer();

				if(!rec){
					//Error callback here?
					return false;
				}

				// NOTE: When we push views as a bulk, we only want to activate the last item.
				// Thus we suspend activating views till we're on the last item.
				// This allows us to only load store based on 'activate' events
				if(index < allItems.length - 1){
					f.suspendActivateEvents();
				} else{
					f.resumeActivateEvents();
				}

				me['load'+type](null,rec,true);
				state[pair[0]] = stateForKey(pair[0], pair[1]);
				j++;

				return true;
			});

			for(j;j<stackOrder.length;j++){
				state[stackOrder[j]] = undefined;
			}

			//If we have a comment push it onto the last view
			//which should be the topic.  Also make sure we push it into
			//state since we just blanked it out
			maybeTopic = me.getForumViewContainer().peek();
			if(maybeTopic.goToComment){
				if(comment){
					maybeTopic.on('commentReady', function(){ Ext.callback(cb, scope, [true]);}, null, { single: true});
					maybeTopic.goToComment(comment[1]);
					state[comment[0]] = comment[1];
					shouldFireCallBack = false;
				}
				else{
					maybeTopic.goToComment(null);
				}
			}


			//Push state if not requested to be silent
			if(silent !== true){
				this.pushState(state);
			}

			//callback
			if(shouldFireCallBack){
				Ext.callback(cb, scope, [true]);
			}
		});
	},


	getRecords: function(base, ids, callback){
		var href = getURL(base),
			finish = ids.length,
			me = this;


		if(!base || Ext.isEmpty(ids)){
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
						var msgCfg = {};

						pair[1] = null;
						console.error('Could not load record',Globals.getError(e));
						if(resp.status === 404){
							msgCfg.title = 'Not Found!';
							msgCfg.msg = 'The object you are looking for no longer exists.';
							alert(msgCfg);
						}
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
				state[this.stateKeyPrecedence[keyIx]] = undefined;
			}

			this.pushState(state);

		} catch(e) {
			console.warn(Globals.getError(e));
		}

		return true;
	},


	pushState: function(s){
		history.pushState({forums: s});
	},


	replaceState: function(s){
		history.replaceState({forums: s});
	},


	presentTopic: function(record, commentId, cb, scope){
		var callback = arguments.length > 2 ? cb : undefined,
			cid = arguments.length > 1 ? commentId : undefined,
			toShowHref = record && record.get ? record.get('href') : record;

		if(!record || !toShowHref){
			Ext.callback(callback, scope, [false]);
			return;
		}

		if(!Ext.isEmpty(cid)){
			toShowHref = toShowHref + '/' + cid;
		}

		console.log('should navigate to forum topic: ', record, cid, callback);

		//The idea here is similar to state restoration.  Pop us down to the last
		//stack view that matches (which is worst case the root).  Then using the
		//href on the passed record build record hrefs that we need, fetch them,
		//and then build the necessary stores.

		//First we pop down the first view whose records href is a prefix of ours
		//or the root
		function predicate(item, i){
			var rec = item.record,
				href = rec ? rec.get('href') : undefined;
			return rec && href && toShowHref.indexOf(href) === 0;
		}

		this.popToLastViewMatchingPredicate(predicate);
		this.pushNecessaryViews(toShowHref, cid ? 'comment' : 'topic', cb, scope);
	},


	showLevel: function(selModel, level, record, cfg, storeCfg, extraParams, viewContainer){
		var c = this.getStackContainer(selModel || viewContainer),
			store, cmpCfg, storeId = record.getContentsStoreId(),
			prefix = c.typePrefix || 'forums';

		store = Ext.getStore(storeId) || record.buildContentsStore(storeCfg, extraParams);

		cmpCfg = Ext.applyIf({xtype: prefix+'-'+level+'-list', record: record, store: store}, cfg || {});
		c.add(cmpCfg);
	},


	loadRootCallBack: function(resp, req, boards, urls, store){
		var o = ParseUtils.parseItems(resp.responseText),
				c;

			if(req && req.community) {
				c = req.community;
				Ext.each(o,function(o){
					o.communityUsername = c.getId();
					if(o.get('Creator') === c.getId()){ o.set('Creator',c); }});
			}

			Ext.each(o,function(b){
				//We create forums on the backend, so if the board has 0, don't show it.
				if(b.get('ForumCount') > -1){
					boards.push(b);
				}
			});

			this.loadRootMaybeFinish(urls,boards,store);
	},

	
	loadRootMaybeFinish: function(urls,boards,store){
		urls.handled--;
		var r = boards.first(),
			me = this;
		if(urls.handled === 0){
			console.log('List of boards:',boards);
			store.add(boards);
			if(boards.length === 1){
				me.loadBoard(null,r,true);
				me.replaceState({
					board:{
						community: r.communityUsername,
						isUser: true
					},
					forum: undefined,
					topic: undefined,
					comment: undefined
				});
			}		
			delete me.loadingRoot;
			me.fireEvent('root-loaded');
		}
	},


	loadRootRequest: function(url,community,success,failure,scope){
		Ext.Ajax.request({url: url, community: community, success: success, failure: failure, scope: scope});
	},


	loadRoot: function(view){
		function makeUrl(c){ return c && c.getLink('DiscussionBoard'); }

		//Just for now...
		function fn(resp,req){
			me.loadRootCallBack(resp,req,boards,urls,store);
		}

		function maybeFinish(){
			me.loadRootMaybeFinish(urls,boards,store);
		}

		var communities = $AppConfig.userObject.getCommunities(),
			urls = Ext.Array.map(communities,makeUrl),
			boards = [],
			me = this,
			root,
			store = NextThought.store.NTI.create({
				model: 'NextThought.model.forums.Forum', id:'flattened-boards-forums'
			});

		me.loadingRoot = true;
		
		urls.handled = urls.length;

		root = view.add({store:store, xtype: 'forums-root', stateKey: 'root'});

		Ext.each(urls,function(url,i){

			if(!url){ maybeFinish(); return; }

			me.loadRootRequest(url,communities[i],fn,maybeFinish,me);
			//Ext.Ajax.request({ url: url, community: communities[i], success: fn, failure: maybeFinish, scope: me});
		});	
	},


	loadBoard: function(selModel, record, silent, cfg){
		if( Ext.isArray(record) ){ record = record[0]; }

		var me = this,
			community = record.get('Creator');

		function finish(){
			me.showLevel(selModel, 'forum', record, Ext.applyIf({stateKey: 'board'},cfg||{}));

			if(silent !== true){
				//The communities board we are viewing
				me.pushState({board:{community: community,isUser: true}, forum: undefined, topic: undefined, comment: undefined});
			}
		}

		if( community.isModel ){
			community = community.get('Username');
		}
		else {
			UserRepository.getUser(community,function(c){
				record.set('Creator',c);
				finish();
			});
			return;
		}

		finish();
	},


	loadForum: function(selModel, record, silent){
		if( Ext.isArray(record) ){ record = record[0]; }
		var me = this;

		function finish(){
			me.showLevel(selModel, 'topic', record, {stateKey: 'forum'});
			if(silent !== true){
				me.pushState({'forum': record.get('ID'), topic: undefined, comment: undefined}); //The forum we are viewing
			}
		}

		UserRepository.getUser(record.get('Creator'), function(c){
			record.set('Creator', c);
			finish();
		});
	},


	saveTopicComment: function(editor, record, valueObject, successCallback){
		var postCmp = editor.up('[record]'),
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
				url: isEdit ? undefined : postRecord && postRecord.getLink('add'),//only use postRecord if its a new post.
				scope: this,
				success: function(rec){
					var topicCmp = Ext.ComponentQuery.query('forums-topic')[0];
					console.log('Success: ', rec);
					unmask();
					if(!postCmp.isDestroyed){
						if(!isEdit){
							if(postCmp.store){
								postCmp.store.insert(0,rec);
							}
							if(topicCmp && postCmp !== topicCmp && topicCmp.store){
								topicCmp.store.add(rec);
							}
						}
						editor.deactivate();
						editor.setValue('');
						editor.reset();
					}

					Ext.callback(successCallback, null, [editor, postCmp, rec]);

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


	showTopicEditor: function(cmp, topicRecord){
		var c = this.getStackContainer(cmp),
			o = c.items.last();

		while(o && !o.getPath){
			o = o.prev();
		}

		if(o && !o.getPath) {

			o = null;
		}

		c.add({xtype:'forums-topic-editor', record: topicRecord, path: o && o.getPath()});
	},


	enableTopicNavigation: function(cmp, record, callback){
		if(!record || !cmp){ return; }
		var storeId = 'CommunityForum'+'-'+record.get('ContainerId'),
			store = Ext.StoreManager.lookup(storeId);

		if(store){
			store.on('load', function(){
				Ext.callback(callback, null, [cmp, store]);
			}, null, {'single': true});

			if(!store.isLoading()){
				store.load();
			}
		}
		else{
			console.warn('Could not find store which owns record: ', record);
		}
	},


	switchTopic: function(cmp, record, direction){
		var s = record.store,
			dx = (direction==='next' ? -1 : 1),
			r, sid;

		if(!s){
			sid = 'CommunityForum'+'-'+record.get('ContainerId');
			s =  Ext.StoreManager.lookup(sid);
		}
		r = s && s.find('ID', record.get('ID'), 0, false, true, true);
		r = s && s.getAt(r+dx);
		if(r){
			cmp.destroy();
			this.loadTopic(null,r);
		}
	},


	loadTopic: function(selModel, record, silent){
		if( Ext.isArray(record) ){ record = record[0]; }
		var c = this.getStackContainer(selModel),
			o = c.items.last();

		if(o && !o.getPath) { o = null; }

		c.add({xtype: 'forums-topic', record: record, path: o && o.getPath(), stateKey: 'topic'});

		if(silent !== true && (selModel || {}).suppressPushState !== true){
			this.pushState({'topic': record.get('ID'), comment: undefined});
		}
	},


	applyTopicToStores: function(topic){
		var recordForStore;
		this.getController('UserData').applyToStoresThatWantItem(function(id,store){
			if(store){
				if(store.findRecord('NTIID',topic.get('NTIID'),0,false,true,true)){
					console.warn('Store already has item with id: '+topic.get('NTIID'), topic);
				}

				if(!recordForStore){
					//Each store gets its own copy of the record. A null value indicates we already added one to a
					// store, so we need a new instance.  Read it out of the orginal raw value.
					recordForStore = ParseUtils.parseItems([topic.raw])[0];
				}

				//The store will handle making all the threading/placement, etc
				store.add(recordForStore);
				//once added, null out this pointer so that subsequant loop iterations don't readd the same instance to
				// another store. (I don't think our threading algorithm would appreciate that)
				recordForStore = null;
			}
		}, topic);
	},


	saveTopicPost: function(editorCmp, record, title, tags, body, autoPublish){
		var isEdit = Boolean(record),
			cmp = editorCmp.prev(),
			post = isEdit ? record.get('headline') : NextThought.model.forums.CommunityHeadlinePost.create(),
			forumRecord = cmp && cmp.record,
			me = this;

		// NOTE: Forums entries are PUBLIC only.
		autoPublish = true;

		post.set({
			'title': title,
			'body': body,
			'tags': tags||[]
		});

		if(isEdit){
			record.set({'title': title});
		}

		function finish(entry){
			if(!isEdit){
				//This is how the views are reading the display name... pre-set the Creator as your userObject.
				if(isMe(entry.get('Creator'))){
					entry.set('Creator',$AppConfig.userObject);
				}
				try {
					if(cmp.store){
						cmp.store.insert(0,entry);
					}
				}
				catch(e){
					console.error('Could not insert post into widget',Globals.getError(e));
				}

				me.applyTopicToStores(entry);
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
			post.getProxy().on('exception', editorCmp.onSaveFailure, editorCmp, {single:true});
			post.save({
				url: isEdit ? undefined : forumRecord && forumRecord.getLink('add'),//only use postRecord if its a new post.
				scope: this,
				success: function(post,operation){
					var entry = isEdit? record : ParseUtils.parseItems(operation.response.responseText)[0];

					if(autoPublish !== undefined){
						if(autoPublish !== entry.isPublished()){
							entry.publish(editorCmp,finish,this);
							return;
						}
					}

					//We have nested objects here.  The entry contains a headline whose body, title, and tags
					//have been updated.  Our magic multi object setter won't find the nested object in the store
					//so we set it back on the original record to trigger other instances of the entry to be updated.
					//Not doing this reflects itself by the body of the topic not updating in the activity view
					if(isEdit && record){
						record.set('headline', record.get('headline'));
					}

					unmask();
					finish(entry);
				},
				failure: function(){
					console.debug('failure',arguments);
					unmask();
				}
			});
		}
		catch(e){
			console.error('An error occurred saving blog', Globals.getError(e));
			unmask();
		}
	},


	deleteObject: function(record, cmp, callback){
		var idToDestroy, me = this;
		if(!record.get('href')){
			record.set('href',record.getLink('contents').replace(/\/contents$/,'')||'no-luck');
		}
		idToDestroy = record.get('NTIID');

		function maybeDeleteFromStore(id, store){
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
		}

		record.destroy({
			success:function(){
				me.getController('UserData').applyToStoresThatWantItem(maybeDeleteFromStore, record);

				//Delete anything left that we know of
				Ext.StoreManager.each(function(s){
					maybeDeleteFromStore(null, s);
				});

				Ext.callback(callback, null, [cmp]);
			},
			failure: function(){
				alert('Sorry, could not delete that');
			}
		});
	},

	//Socket handling
	incomingChange: function(change){
		function updateRecordFieldCount(id, field){
			if(!id || !field){
				return;
			}

			Ext.StoreManager.each(function(s){
				var found = s.getById(id);
				if(found){
					found.set(field, found.get(field)+1);
					return false; //Note we break here because set will have updated the remaining instances;
				}
				return true;
			});
		}


		var item,
			maybeTopic = this.getForumViewContainer().peek();

		if(!change.isModel){
			change = ParseUtils.parseItems([change])[0];
		}

		item = change.get('Item');
		if(item && /generalforumcomment$/.test(item.get('MimeType'))){
			if(maybeTopic && maybeTopic.addIncomingComment){
				maybeTopic.addIncomingComment(item);
				return;
			}
			updateRecordFieldCount(item.get('ContainerId'), 'PostCount');
		}
		else if(item && /communityheadlinetopic$/.test(item.get('MimeType'))){
			updateRecordFieldCount(item.get('ContainerId'), 'TopicCount');
		}
	},


	//Search functions
	highlightSearchResult: function(result, fragIdx){
		var topicView = this.getForumViewContainer().peek(),
			hit = result.hit,
			frag = fragIdx !== undefined ? hit.get('Fragments')[fragIdx] : undefined;

		if(topicView && topicView.showSearchHit){
			topicView.showSearchHit(hit, frag);
		}
	},

	//NTIID navigation handler
	navigateToForumContent: function(obj, fragment){
		var me = this;

		if(obj instanceof NextThought.model.forums.Base){
			if( me.fireEvent('show-view', 'forums', true) ){
				me.presentTopic(obj);
				return false;
			}
		}
		return true;
	}
});

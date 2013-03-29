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
				'new-topic':this.showTopicEditor,
				'select':this.loadTopic
			},
			'forums-topic': {
				'navigate-topic':this.switchTopic,
				'delete-post': this.deleteObject,
				'edit-topic':this.showTopicEditor
			},
			'forums-topic-editor':{
				'save-post': this.saveTopicPost
			},
			'forums-topic-comment':{
				'delete-topic-comment': this.deleteObject
			},
			'profile-forum-activity-item':{
				'delete-post': this.deleteObject,
				'fill-in-path': this.fillInPath
			},
			'profile-forum-activity-item nti-editor':{
				'save': this.saveTopicComment
			},
			'forums-topic nti-editor': {
				'save': this.saveTopicComment
			},
			'search-result':{
				'highlight-topic-hit': this.highlightSearchResult
			},
			'*': {
				'show-topic': this.presentTopic
			}
		});
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
				maybeTopic;
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
				state[stackOrder[j]] = undefined;
			}

			//If we have a comment push it onto the last view
			//which should be the topic.  Also make sure we push it into
			//state since we just blanked it out
			maybeTopic = me.getForumViewContainer().peek();
			if(maybeTopic.goToComment){
				if(comment){
					maybeTopic.goToComment(comment[1]);
					state[comment[0]] = comment[1];
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
			Ext.callback(cb, scope, [true]);
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


	presentTopic: function(record, commentId, cb, scope, eOpts){
		var callback = arguments.length > 3 ? cb : undefined,
			cid = arguments.length > 2 ? commentId : undefined,
			toShowHref = record ? record.get('href') : null;

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


	showLevel: function(level, record, cfg){
		var c = this.getForumViewContainer(),
			url = record.getLink('contents'),
			store, cmpCfg;


		store = NextThought.store.NTI.create({
			storeId: record.get('Class')+'-'+record.get('ID'),
			url: url,
			sorters: [{
				property: 'CreatedTime',
				direction: 'DESC'
			}]
		});
		store.proxy.extraParams = Ext.apply(store.proxy.extraParams || {}, {
			sortOn: 'CreatedTime',
			sortOrder: 'descending'
		});
		store.load();

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
					o.communityUsername = c.getId();
					if(o.get('Creator') === c.getId()){ o.set('Creator',c); }});
			}

			Ext.each(o,function(b){
				//We create forums on the backend, so if the board has 0, don't show it.
				if(b.get('ForumCount') > 0){
					boards.push(b);
				}
			});

			maybeFinish();
		}

		function maybeFinish(){
			urls.handled--;
			var r = boards.first();
			if(urls.handled === 0){
				console.log('List of boards:',boards);
				store.add(boards);
				if(boards.length === 1){
					me.loadBoard(null,r,true,{isRoot:true});
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
			}
		}

		var communities = $AppConfig.userObject.getCommunities(),
			urls = Ext.Array.map(communities,makeUrl),
			boards = [],
			me = this,
			root,
			store = NextThought.store.NTI.create({
				model: 'NextThought.model.forums.Forum', id:'flattened-boards-forums'
			});


		urls.handled = urls.length;

		root = view.add({store:store, xtype: 'forums-root', stateKey: 'root'});

		Ext.each(urls,function(url,i){

			if(!url){ maybeFinish(); return; }

			Ext.Ajax.request({ url:url, community: communities[i], success: fn, failure: maybeFinish });
		});
	},


	loadBoard: function(selModel, record, silent, cfg){
		var community;
		if( Ext.isArray(record) ){ record = record[0]; }
		this.showLevel('forum', record, Ext.applyIf({stateKey: 'board'},cfg||{}));

		community = record.get('Creator');
		if(community.isModel){
			community = community.get('Username');
		}
		if(silent !== true){
			//The communities board we are viewing
			this.pushState({board:{community: community,isUser: true}, forum: undefined, topic: undefined, comment: undefined});
		}
	},


	loadForum: function(selModel, record, silent){
		if( Ext.isArray(record) ){ record = record[0]; }
		this.showLevel('topic', record, {stateKey: 'forum'});
		if(silent !== true){
			this.pushState({'forum': record.get('ID'), topic: undefined, comment: undefined}); //The forum we are viewing
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

		var postCmp = editor.up('forums-topic') || editor.up('profile-forum-activity-item'),
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


	showTopicEditor: function(cmp, topicRecord){
		var c = this.getForumViewContainer(),
			o = c.items.last();

		while(o && !o.getPath){
			o = o.prev();
		}

		if(o && !o.getPath) {

			o = null;
		}

		this.getForumViewContainer().add({xtype:'forums-topic-editor', record: topicRecord, path: o && o.getPath()});
	},


	switchTopic: function(cmp, record, direction){
		var s = record.store,
			dx = (direction==='next' ? -1 : 1),
			r = s && s.find('ID', record.get('ID'), 0, false, true, true);

		r = s && s.getAt(r+dx);
		if(r){
			cmp.destroy();
			this.loadTopic(null,r);
		}
	},


	loadTopic: function(selModel, record, silent){
		if( Ext.isArray(record) ){ record = record[0]; }
		var c = this.getForumViewContainer(),
			o = c.items.last();

		if(o && !o.getPath) { o = null; }

		c.add({xtype: 'forums-topic', record: record, path: o && o.getPath(), stateKey: 'topic'});

		if(silent !== true){
			this.pushState({'topic': record.get('ID'), comment: undefined});
		}
	},


	applyTopicToStores: function(topic){
		var recordForStore;
		LocationProvider.applyToStoresThatWantItem(function(id,store){
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
		console.log('Do search highlighting here.', arguments);
	}
});

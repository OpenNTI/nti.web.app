Ext.define('NextThought.view.account.activity.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.activity-panel',

	requires: [
		'NextThought.view.account.activity.Popout',
		'NextThought.view.account.activity.blog.Preview',
		'NextThought.view.account.activity.note.Popout',
		'NextThought.view.account.activity.topic.Popout',
		'NextThought.view.account.contacts.management.Popout',
		'NextThought.model.converters.GroupByTime',
		'NextThought.model.Highlight',
		'NextThought.model.Redaction',
		'NextThought.model.Note',
		'NextThought.model.forums.Post',
		'NextThought.model.forums.HeadlineTopic'
	],

	overflowY: 'auto',
	overflowX: 'hidden',
	cls: 'activity-panel',


	items: [
		{
			activitiesHolder: 1,
			xtype: 'box',
			autoEl:{
				cn:[{
					cls:"activity loading",
					cn: [{cls: 'name', tag: 'span', html: 'Loading...'},' please wait.']
				}]
			}
		}
	],


	feedTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag:'tpl', 'if':'length==0', cn:[{
			cls:"activity nothing rhp-empty-list",
			cn: [' No Activity Yet']
		}]},
		{tag:'tpl', 'for':'.', cn:[
			{tag:'tpl', 'if':'activity', cn:[{
				cls:'activity {type}',
				id: '{guid}',
				cn: [
					{cls: 'name', tag: 'span', html: '{name}'},
					{tag:'tpl', 'if':'verb', cn:[{tag:'span', cls:'verb', html:' {verb} '}]},
					' {message} ',
					{tag:'tpl', 'if':'with', cn:['with {with}']}]
			}]},
			{tag:'tpl', 'if':'label', cn:[{
				cls: 'divider', html: '{label}'
			}]}
		]}

	])),


	initComponent: function(){
		this.callParent(arguments);
		this.store = Ext.getStore('Stream');

		//FIXME, eww more datachanged listening.
		//use add, remove, load, and refresh instead like for FLs
		this.mon(this.store,{
			scope: this,
			datachanged: this.maybeReload,
			//load: this.maybeReload,
			clear: function(){console.log('stream clear',arguments);},
			remove: function(){console.log('stream remove',arguments);},
			update: function(){console.log('stream update',arguments);}
		});

		//Our contacts/community split makes us dependent on knowing our contacts.
		//Now that the stream is so fast we are often ready to go before we have that info.
		//so if contacts get loaded or refreshed do an update if we are rendered.  Note
		//we don't listen to contacts-updated b/c we don't want to do a lot of work when people add/remove
		//contacts
		this.mon(Ext.getStore('FriendsList'), {
			scope: this,
			'contacts-refreshed': 'maybeReload'
		});

		this.on({
			scope: this,
			activate:'onActivate',
			'scroll-stopped': 'onScrollStopped'
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.el,{
			scope: this,
			'click':'itemClick',
			'mouseover': 'itemHover'
		});

		this.mon(this.down('box').getEl(),'scroll', 'viewScrollHandler', this);

		this.itemClickMap = {
			'personalblogentry': this.blogEntryClicked,
			'personalblogcomment': this.blogCommentItemClicked,
			'communityheadlinetopic': this.forumTopicClicked,
			'generalforumcomment': this.forumCommentClicked
		};
	},


	fetchMore: function(){
		var s = this.store,
			centerButton = this.el.down('.center-button');

		if (!s.hasOwnProperty('data')) {
			return;
		}

		this.currentCount = s.getCount();
		if(s.hasAdditionalPagesToLoad()){
			this.el.parent().mask('Loading...','loading');
			s.clearOnPageLoad = false;
			s.nextPage();
		}
		else{
			if(centerButton){
				this.el.down('.center-button').remove();
			}
			this.el.parent().unmask();
		}
	},


	maybeReload: function(){
		if (this.isVisible() && this.rendered){
			this.reloadActivity();
		}
	},


	reloadActivity: function(store){
		var container = this.down('box[activitiesHolder]'),
			totalExpected,
		items = [], oldestRecord, me = this;

		if(store && !store.isStore){
			store = null;
		}

		this.store = store = store||this.store;

		this.store.suspendEvents();
		this.store.clearFilter(true);
		this.store.sort();
		//For bonus points tell the user how far back they are asking for
		oldestRecord = this.store.unfilteredLast();
		this.store.filterBy(this.filterStore, this);
		this.store.resumeEvents();

		totalExpected = store.getCount();
		if(this.currentCount !== undefined && totalExpected <= this.currentCount){
			console.log('Need to fetch again. Didn\'t return any new data');
			delete this.currentCount;
			this.fetchMore();
			return;
		}

		//Did we get anymore for this tab

		if(!this.rendered){
			this.on('afterrender',this.reloadActivity,this,{single:true});
			return;
		}

		console.log('Redrawing activity panel');

		this.stream = {};

		function groupToLabel(name){
			return Ext.data.Types.GROUPBYTIME.groupTitle(name, false);
		}

		function maybeAddMoreButton(){
			var s=me.store, oldestGroup = oldestRecord ? groupToLabel(s.getGroupString(oldestRecord)) : null;
			if(s.hasAdditionalPagesToLoad()){
				Ext.widget('button', {
					text: oldestGroup && oldestGroup !== 'Older' ? 'More from ' + oldestGroup.toLowerCase() : 'Load more',
					renderTo: Ext.DomHelper.append(container.getEl(), {cls:'center-button'} ),
					scale: 'medium',
					ui: 'secondary',
					cls: 'more-button',
					handler: function(){
						me.fetchMore();
					}});
				return true;
			}
			return false;
		}

		function doGroup(group){
			var label = groupToLabel(group.name);

			if(label){
				items.push({ label: label });
			}

			function extend(){
				totalExpected++;
			}

			//We use a similar strategy to the one that Notifications uses

			function maybeFinish(){
				totalExpected--;
				if(totalExpected === 0){
					me.feedTpl.overwrite(container.getEl(),items);
					maybeAddMoreButton();
					container.updateLayout();
				}
			}
			Ext.each(group.children,function(c){
				if(/deleted/i.test(c.get('ChangeType'))){
					maybeFinish();
					return;
				}

				var item = this.changeToActivity(c, maybeFinish, extend);
				items.push(item);
				UserRepository.getUser(item.name, function(u){
					item.name = u.getName();
					maybeFinish();

				});

			},this);
		}

		if(store.getGroups().length === 0){
			Ext.DomHelper.overwrite(container.getEl(), []); //Make sure the initial mask clears
			if(!maybeAddMoreButton()){
				Ext.DomHelper.overwrite(container.getEl(), {
					cls:"activity nothing rhp-empty-list",
					cn: [' No Activity Yet']
				});
			}
			container.updateLayout();
		}

		Ext.each(store.getGroups(),doGroup,this);

		this.el.parent().unmask();

	},


	changeToActivity: function(c, maybeFinish, extend){
		var item = c.get('Item'),
			cid = item? item.get('ContainerId') : undefined,
			guid = guidGenerator(),
			activity;

		function getType(item){
			if(!item){return '';}
			var type = item.getModelName().toLowerCase();

			if(item.get('inReplyTo')){
				type = 'comment';
			}

			return type;
		}

		activity = this.stream[guid] = Ext.apply({
			activity: true,
			guid: guid,
			name: c.get('Creator'),
			record: item,
			type: getType(item),
			ContainerId: cid,
			ContainerIdHash: cid? IdCache.getIdentifier(cid): undefined
		},this.getMessage(c, cid, guid, maybeFinish, extend));

		Ext.callback(extend);
		UserRepository.getUser(c.get('Creator'),function(u){
			activity.name = u.getName();
			Ext.callback(maybeFinish);
		});

		return activity;
	},


	getMessage: function(change, cid, guid, maybeFinish, extend) {
		var item = change.get('Item'),
				type = change.get('ChangeType'),
				stream = this.stream,
				result = null;

		//TODO: XXX: FIX this to be better... if/ifelse/else branches are ugly.

		function getName(type){

			function resolve(meta){

				stream[guid].verb = 'Shared a '+type;
				stream[guid].message = Ext.String.ellipsis(' in &ldquo'+((meta||{}).label||''),50,true)+'&rdquo;';

				Ext.callback(maybeFinish);
			}

			Ext.callback(extend);
			if(cid){
				LocationMeta.getMeta(cid,resolve);
				return;
			}
			resolve(null);
		}


		if (!item){
			result = {message:'Unknown'};
		}

		else if (item instanceof NextThought.model.User ) {
			result = {
				name: item.getName(),
				verb: ((/circled/i).test(type) ? ' added you as a contact.' : '?')
			};
		}

		else if (item instanceof NextThought.model.Note ){
			result = {
				message:Ext.String.format('&ldquo;{0}&rdquo;', Ext.String.ellipsis(item.getBodyText(),50,true)),
				verb: item.get('inReplyTo') ? 'said':'shared a note'
			};
		}

		else if (item instanceof NextThought.model.Highlight ) {
			console.trace(); //does this branch (highlight and redaction) get called??
			Ext.defer(getName,1,this,[item.getModelName().toLowerCase()]);
			result = {};
		}

		else if(item instanceof NextThought.model.forums.HeadlineTopic ){
			result = {
				message: Ext.String.ellipsis(item.get('headline').get('title'),50,true),
				verb: item.getActivityLabel()
			};
		}

		else if(item instanceof NextThought.model.forums.Post ){
			result = {
				message: Ext.String.format('&ldquo;{0}&ldquo;', Ext.String.ellipsis(item.getBodyText(),50,true)),
				verb: 'commented'
			};
		}

		if(!result){
			console.error('Not sure what activity text to use for ', type, item.getModelName(), item, change);
		}
		return result;
	},


	itemClick: function(e){
		var activityTarget = e.getTarget('div.activity:not(.deleted)', null, true),
			guid, item, rec, me = this, className;

		guid = (activityTarget||{}).id;
		item = this.stream[guid];
		rec = (item||{}).record;

		if (!rec || rec.get('Class') === 'User'){
			return false;
		}
		e.stopEvent();

		className = rec.get('Class').toLowerCase();

		try{
			if(this.itemClickMap[className]){
				this.itemClickMap[className].call(this, rec);
			}
			else{
				this.fireEvent('navigation-selected', item.ContainerId, rec);
			}
		}
		catch(er){
			console.error(Globals.getError(er));
		}
		return false;
	},


	blogEntryClicked: function(rec){
		var me = this;
		UserRepository.getUser(rec.get('Creator'), function(user){
			me.fireEvent('navigate-to-blog', user, rec.get('ID'));
		});
	},


	forumTopicClicked: function(rec){
		if(this.fireEvent('before-show-topic', rec)){
			this.fireEvent('show-topic', rec);
		}
	},


	forumCommentClicked: function(rec){
		var me = this;
		function success(r){
			if(me.fireEvent('before-show-topic', r)){ me.fireEvent('show-topic', r, rec.get('ID')); }
		}

		function fail(){ console.log('Can\t find forum topic to navigate to', arguments); }
		$AppConfig.service.getObject(rec.get('ContainerId'), success, fail, me);

	},


	blogCommentItemClicked: function(rec){
		var me = this;

		function success(r){
			UserRepository.getUser(r.get('Creator'), function(user){
				me.fireEvent('navigate-to-blog', user, r.get('ID'),rec.get('ID'));
			});
		}

		function fail(){
			console.log('Can\t find blog entry to navigate to', arguments);
		}

		$AppConfig.service.getObject(rec.get('ContainerId'), success, fail, me);
	},


	cancelPopupTimeout: function(){
		clearTimeout(this.hoverTimeout);
	},


	onScrollStopped: function(){
		Ext.callback(this.performAfterScrollAction,this);
		delete this.performAfterScrollAction;
	},


	itemHover: function(e){
		function fn(pop){
			if(pop){
				pop.on('destroy', function(){
					delete me.activeTargetDom;
					console.log('Should have cleared the active target..', me);
				}, pop);
			}
		}
		if(this.isScrolling){
			this.performAfterScrollAction = Ext.bind(this.itemHover,this, arguments);
			return;
		}
		var me = this,
			target = e.getTarget('div.activity',null,true),
			guid = (target||{}).id,
			item = me.stream[guid],
			rec = (item||{}).record,
			popout = NextThought.view.account.activity.Popout;


		if(rec && rec.getClassForModel) {
			popout = rec.getClassForModel('widget.activity-popout-',NextThought.view.account.activity.Popout);
		}

		if(!rec || me.activeTargetDom === Ext.getDom(target)){return;}

		me.cancelPopupTimeout();
		me.hoverTimeout = Ext.defer(function(){
			target.un('mouseout',me.cancelPopupTimeout,me,{single:true});
			popout.popup(rec, target, me, undefined, fn);
			me.activeTargetDom = Ext.getDom(target);
		},500);

		target.on('mouseout',me.cancelPopupTimeout,me,{single:true});
	},


	viewScrollHandler: function(e){
		//NOTE: we want to avoid trying to display the popup while the user is scrolling.
		var me = this;
		clearTimeout(me.scrollingTimer);
		me.isScrolling = true;
		me.scrollingTimer = Ext.defer(function(){
			me.isScrolling = false;
			me.fireEvent('scroll-stopped');
		}, 500);
	},


	//Right now things in the contacts are things shared
	//directly to you, or creators that are connected to you.  Circled change
	//also belong here.
	belongsInMyContacts: function(change, flStore, communities, noVerify){
		var belongs = false,
			username = $AppConfig.username,
			item = change.get('Item'),
			sharedWith = item.get('sharedWith') || [],
			creator = item.get('Creator');

		if(/circled/i.test(change.get('ChangeType'))){
			belongs = true;
		}

		belongs = belongs || Ext.Array.contains(sharedWith, username);
		if(!belongs && flStore && flStore.isConnected){
			belongs = flStore.isConnected(creator);
		}

		//Just log an error for now so we know there isn't
		//a missing condition we didn't consider
		if(!noVerify && !belongs && !this.belongsInCommunity(change, flStore, communities, true)){
			console.error('Danger, dropping change that does not pass either filter', change);
		}
		return belongs;
	},

	//If there is a community in the shared with list
	//it goes in the community tag
	belongsInCommunity: function(change, flStore, communities, noVerify){
		var item = change.get('Item'),
			sharedWith = item.get('sharedWith') || [],
			foundInCommunities = false;

		Ext.Array.each(sharedWith, function(u){
			if (Ext.Array.contains(communities, u)){
				foundInCommunities = true;
				return false;
			}
			return true;
		});

		//Just log an error for now so we know there isn't
		//a missing condition we didn't consider
		if(!noVerify && !foundInCommunities && !this.belongsInMyContacts(change, flStore, communities, true)){
			console.error('Danger, dropping change that does not pass either filter', change);
		}
		return foundInCommunities;
	},


	filterStore: function(change){
		var communities = ($AppConfig.userObject.getCommunities() || []),
			community = (this.filter === 'inCommunity'),
			flStore = Ext.getStore('FriendsList'),
			me = this, communityNames = [];

		//Filter out "Modified" change events for community headline
		//topics.  See trello 1269
		function filterModifiedTopics(c){
			if(!c){
				return true;
			}
			var type = c.get('ChangeType') || '',
				item = c.get('Item'), mime;

			if(item && (/modified/i).test(type)){
				mime = item.get('MimeType');
				if(mime &&
				   ((/.*?communityheadlinetopic$/i).test(mime) || (/.*?personalblogentry$/i).test(mime))){
					return false;
				}
			}

			return true;
		}

		if(!filterModifiedTopics(change)){
			return false;
		}

		// Strip away all DFL in communities.
		Ext.Array.each(communities, function(c){
			if(c.isCommunity){
				communityNames.push(c.get('Username'));
			}
		});

		if(community){
			return me.belongsInCommunity(change, flStore, communityNames);
		}

		return me.belongsInMyContacts(change, flStore, communityNames);
	},


	onActivate: function(){
		//Suspend events and let the last sort take care of it
		this.store.suspendEvents();
		this.store.clearFilter(true);
		this.store.filterBy(this.filterStore, this);
		this.store.resumeEvents();
		this.store.sort();
		//Now the listeners on the store will take care of rendering.
	},


	getStore: function(){
		return this.store;
	},


	getActiveView: function(){
		return this;
	},

	applyFilters: function(mimeTypes, filterTypes){
		if(Ext.isEmpty(mimeTypes) && Ext.isEmtpy(filterTypes)){
			return;
		}

		if(Ext.isEmpty(filterTypes)){
			filterTypes.push(this.filter);
		}

		var v = this.getActiveView(),
			s = v  && v.getStore();

		s.removeAll();

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			sortOn: 'relevance',
			sortOrder: 'descending',
			filters: filterTypes.join(','),
			filterOperator: (filterTypes.length > 1)? '0' : '1',
			accept: mimeTypes.join(',')
		});

		s.load();
	}

});

Ext.define('NextThought.view.account.activity.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.activity-view',

	requires: [
		'NextThought.view.account.activity.Popout',
		'NextThought.view.account.contacts.management.Popout',
		'NextThought.view.account.activity.BlogPopout',
		'NextThought.model.converters.GroupByTime'
	],

	overflowY: 'hidden',
	overflowX: 'hidden',
    cls: 'activity-view',

	layout: {
		type: 'vbox',
		align: 'stretch',
		reserveScrollbar: false
	},

	items: [
		{
			activitiesHolder: 1,
			xtype: 'box',
			flex: 1,
			overflowX: 'hidden',
			overflowY: 'auto',
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
			cls:"activity nothing",
			cn: [' No Activity yet']
		}]},
		{tag:'tpl', 'for':'.', cn:[
			{tag:'tpl', 'if':'activity', cn:[{
				cls:'activity {type}',
				id: '{guid}',
				cn: [{cls: 'name', tag: 'span', html: '{name}'},' {message} ',{tag:'tpl', 'if':'with', cn:['with-name']}]
			}]},
			{tag:'tpl', 'if':'label', cn:[{
				cls: 'divider', html: '{label}'
			}]}
		]}

	])),


	initComponent: function(){
		var me = this;
		this.callParent(arguments);
		this.store = Ext.getStore('Stream');
		this.mon(this.store,{
			scope: this,
			datachanged: this.maybeReload,
			//load: this.maybeReload,
			clear: function(){console.log('stream clear',arguments);},
			remove: function(){console.log('stream remove',arguments);},
			update: function(){console.log('stream update',arguments);}
		});

        this.on('activate', this.onActivate, this);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,{
			scope: this,
			'click':this.itemClick,
			'mouseover': this.itemHover
		});

		this.itemClickMap = {
			'personalblogentry': this.blogEntryClicked,
			'personalblogcomment': this.blogCommentItemClicked,
			'communityheadlinetopic': this.forumTopicClicked,
			'generalforumcomment': this.forumCommentClicked
		};
	},

    fetchMore: function(){
        var s = this.store, max;

        if (!s.hasOwnProperty('data')) {
            return;
        }

        max = s.getPageFromRecordIndex(s.getTotalCount());
		this.currentCount = s.getCount();
        if(s.currentPage < max){
            this.el.parent().mask('Loading...','loading');
            s.clearOnPageLoad = false;
            s.nextPage();
        }
		else{
			this.el.down('.center-button').remove();
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
		oldestRecord = this.store.last();
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
			var s=me.store, max, oldestGroup = oldestRecord ? groupToLabel(s.getGroupString(oldestRecord)) : null;
			max = s.getPageFromRecordIndex(s.getTotalCount());
			if(s.currentPage < max){
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
					cls:"activity nothing",
					cn: [' No Activity yet']
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
				guid = guidGenerator();

		function getType(item){
			if(!item){return '';}
			var type = item.getModelName().toLowerCase();

			if(item.get('inReplyTo')){
				type = 'comment';
			}

			return type;
		}

		this.stream[guid] = {
			activity: true,
			guid: guid,
			name: c.get('Creator'),
			record: item,
			type: getType(item),
			message: this.getMessage(c, cid, guid, maybeFinish, extend),
			ContainerId: cid,
			ContainerIdHash: cid? IdCache.getIdentifier(cid): undefined
		};
		return this.stream[guid];
	},


	getMessage: function(change, cid, guid, maybeFinish, extend) {
		var item = change.get('Item'),
				type = change.get('ChangeType'),
				stream = this.stream;

        function getName(type){

            function resolve(meta){
                stream[guid] = Ext.String.format('Shared a {0} {1}&rdquo;', type,
                    Ext.String.ellipsis( (meta ? (' in &ldquo'+meta.label): '&ldquo;'),50,true));
                Ext.callback(maybeFinish);
            }

            Ext.callback(extend);
            if(cid){
                LocationMeta.getMeta(cid,resolve);
                return;
            }
            resolve(null);
        }


		if (!item){return 'Unknown';}

		if (item.getModelName() === 'User') {
			return item.getName() + (/circled/i).test(type)
					? ' added you as a contact.' : '?';
		}
		else if (item.getModelName() === 'Highlight') {
			Ext.defer(getName,1,this,['highlight']);
		}
		else if (item.getModelName() === 'Redaction') {
            Ext.defer(getName,1,this,['redaction']);
		}
		else if(item.getModelName() === 'PersonalBlogEntry'){
			return Ext.String.format('shared a thought: {0}', Ext.String.ellipsis(item.get('headline').get('title'),50,true));
		}
		else if(item.getModelName() === 'CommunityHeadlineTopic'){
			return Ext.String.format('started a discussion: {0}', Ext.String.ellipsis(item.get('headline').get('title'),50,true));
		}
		else if(item.getModelName() === 'PersonalBlogComment'){
			return Ext.String.format('commented &ldquo;{0}&ldquo;', Ext.String.ellipsis(item.getBodyText(),50,true));
		}
		else if(item.getModelName() === 'GeneralForumComment'){
			return Ext.String.format('commented &ldquo;{0}&ldquo;', Ext.String.ellipsis(item.getBodyText(),50,true));
		}
		else if (item.getModelName() === 'Note'){
			return Ext.String.format('{1}&ldquo;{0}&rdquo;',
					Ext.String.ellipsis(item.getBodyText(),50,true),
					(item.get('inReplyTo') ? 'said ':'')
			);
		}
		else {
			console.error('Not sure what activity text to use for ', type, item.getModelName(), item, change);
			return 'Unknown';
		}

        return '...';
	},


	itemClick: function(e){
		var activityTarget = e.getTarget('div.activity', null, true),
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


	itemHover: function(e){
		var me = this,
			target = e.getTarget('div.activity',null,true),
			guid = (target||{}).id,
			item = me.stream[guid],
			rec = (item||{}).record,
			recordClassName = rec && rec.get ? rec.get('Class') : '',
			alias = "widget.activity-popout-"+recordClassName,
			classRef = Ext.ClassManager.getByAlias(alias),
			popout = !Ext.isEmpty(classRef) ? classRef : NextThought.view.account.activity.Popout;

		if(!rec){return;}

		me.cancelPopupTimeout();
		me.hoverTimeout = Ext.defer(function(){
			target.un('mouseout',me.cancelPopupTimeout,me,{single:true});
			popout.popup(rec,target,target,[-10,-12],0.5, me);
		},500);

		target.on('mouseout',me.cancelPopupTimeout,me,{single:true});
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

		// Strip away all DFL in communities.
		Ext.Array.each(communities, function(c){
			if(c.isCommunity){
				communityNames.push(c.get('Username'));
			}
		});

		if(community){
			return me.belongsInCommunity(change, flStore, communityNames);
		}
		else{
			return me.belongsInMyContacts(change, flStore, communityNames);
		}
    },

    onActivate: function(){
		//Suspend events and let the last sort take care of it
		this.store.suspendEvents();
        this.store.clearFilter(true);
        this.store.filterBy(this.filterStore, this);
		this.store.resumeEvents();
        this.store.sort();
        //Now the listeners on the store will take care of rendering.
    }
});

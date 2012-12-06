Ext.define('NextThought.view.account.activity.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.activity-view',

	requires: [
		'NextThought.view.account.activity.Popout',
		'NextThought.view.account.contacts.management.Popout'
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
			return (name||'').replace(/^[A-Z]\d{0,}\s/,'') || false;
		}

		function maybeAddMoreButton(){
			var s=me.store, max, oldestGroup = oldestRecord ? groupToLabel(s.getGroupString(oldestRecord)) : null;
			max = s.getPageFromRecordIndex(s.getTotalCount());
			if(s.currentPage < max){
				Ext.create('Ext.Button', {
					text: oldestGroup ? 'More from ' + oldestGroup.toLowerCase() : 'Load more',
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
		else if (item.getModelName() === 'Note'){
			return Ext.String.format('{1}&ldquo;{0}&rdquo;',
					Ext.String.ellipsis(item.getBodyText(),50,true),
					(item.get('inReplyTo') ? 'said ':'')
			);
		}
		else {
			console.error('Not sure what activity text to use for ', item, change);
			return 'Unknown';
		}

        return '...';
	},


	itemClick: function(e){
		var activityTarget = e.getTarget('div.activity', null, true),
			guid, item, rec;

		guid = (activityTarget||{}).id;
		item = this.stream[guid];
		rec = (item||{}).record;

		if (!rec || rec.get('Class') === 'User'){
			return false;
		}

		e.stopEvent();
		try{
			this.fireEvent('navigation-selected', item.ContainerId, rec);
		}
		catch(er){
			console.error(Globals.getError(er));
		}
		return false;
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
				popout = NextThought.view.account.activity.Popout;

		if(!rec){return;}

		me.cancelPopupTimeout();
		me.hoverTimeout = Ext.defer(function(){
			target.un('mouseout',me.cancelPopupTimeout,me,{single:true});

			if (rec.get('Class') === 'User'){
				popout = NextThought.view.account.contacts.management.Popout;
			}
			popout.popup(rec,target,target,[-10,-12],0.5, me);

		},500);

		target.on('mouseout',me.cancelPopupTimeout,me,{single:true});
	},

	//Right now things in the contacts are things shared
	//directly to you, or creators in the mycontacts group.  Circled change
	//also belong here
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
		if(!belongs && flStore && flStore.isContact){
			belongs = flStore.isContact(creator);
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
		var communities = $AppConfig.userObject.get('Communities') || [],
			community = (this.filter === 'inCommunity'),
			flStore = Ext.getStore('FriendsList'),
			me = this;
		if(community){
			return me.belongsInCommunity(change, flStore, communities);
		}
		else{
			return me.belongsInMyContacts(change, flStore, communities);
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

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
		this.callParent(arguments);
		this.store = Ext.getStore('Stream');
		this.mon(this.store,{
			scope: this,
			datachanged: this.maybeReload,
			load: this.maybeReload,
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


    maybeReload: function(){
        if (this.isVisible() && !this.dontReload && this.rendered){
            this.reloadActivity();
        }
    },


	reloadActivity: function(store){
        console.log('reloading');
		var container = this.down('box[activitiesHolder]'),
				totalExpected,
				items = [];

		if(store && !store.isStore){
			store = null;
		}

		this.store = store = store||this.store;

		totalExpected = store.getCount();

		if(!this.rendered){
			this.on('afterrender',this.reloadActivity,this,{single:true});
			return;
		}

		this.stream = {};

		function doGroup(group){
			var label = (group.name||'').replace(/^[A-Z]\d{0,}\s/,'') || false,
					me = this;

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
			this.feedTpl.overwrite(container.getEl(), []);
			container.updateLayout();
		}

		Ext.each(store.getGroups(),doGroup,this);

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

		var target = e.getTarget('div.activity',null,true),
				guid = (target||{}).id,
				item = this.stream[guid],
				rec = (item||{}).record,
				targets;

		if (!rec || rec.get('Class') === 'User'){
			return false;
		}

		targets = (rec.get('references') || []).slice();

		e.stopEvent();
		try{
			targets.push( rec.getId() );
			this.fireEvent('navigation-selected', item.ContainerId, targets, false);
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

    onActivate: function(){
        var communities = $AppConfig.userObject.get('Communities') || [],
        	community = (this.filter === 'inCommunity'),
			flStore = Ext.getStore('FriendsList'),
			me = this;

        var filterFn = function(change){
			if(community){
				return me.belongsInCommunity(change, flStore, communities);
			}
			else{
				return me.belongsInMyContacts(change, flStore, communities);
			}
        }

        this.dontReload = true;
        this.store.clearFilter();
        delete this.dontReload;
        this.store.filterBy(filterFn);
        this.store.sort();

        //Now the listeners on the store will take care of rendering.
    }
});

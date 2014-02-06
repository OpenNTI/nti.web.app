Ext.define('NextThought.view.account.activity.Panel', {
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

	mixins: {
		'activityFilter': 'NextThought.mixins.ActivityFilters'
	},

	cls: 'activity-panel scrollable',

	overflowX: 'hidden',
	overflowY: 'auto',

	stateful: true,

	filter: 'inCommunity',

	items: [
		{
			activitiesHolder: 1,
			xtype: 'box',
			autoEl: {
				cls: 'user-data-panel',
				cn: []
			}
		}
	],


	feedTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'length == 0', cn: {
			cls: 'history nothing rhp-empty-list',
			html: 'No Activity Yet'
		}},
		{tag: 'tpl', 'for': '.', cn: [
			{tag: 'tpl', 'if': 'activity', cn: [
				{
					cls: 'activity {type}',
					id: '{guid}',
					cn: [
						{cls: 'name', tag: 'span', html: '{name}'},
						{tag: 'tpl', 'if': 'verb', cn: [
							{tag: 'span', cls: 'verb', html: ' {verb} '}
						]},
						' {message} ',
						{tag: 'tpl', 'if': 'with', cn: ['with {with}']}
					]
				}
			]},
			{tag: 'tpl', 'if': 'label', cn: [
				{
					cls: 'divider', html: '{label}'
				}
			]}
		]}

	])),


	initComponent: function() {
		var me = this;

		me.callParent(arguments);
		me.stream = {};

		me.store = NextThought.store.Stream.create();
		me.store.proxy.extraParams = Ext.clone(Ext.apply(me.store.proxy.extraParams || {}, {
			filters: this.filter,
			filterOperator: '1'
		}));


		this.mon(me.store, {
			scope: me,
			load: function() {
				me.removeMask();
				me.reloadActivity();
			},
			//datachanged: 'maybeReload',
			add: function(change) {
				//FIXME, figure out where this belongs...and insert it.
				me.store.add(change);
				me.reloadActivity();
			},
			clear: function() {
				console.log('stream clear', arguments);
			},
			remove: function() {
				console.log('stream remove', arguments);
			},
			update: function() {
				console.log('stream update', arguments);
				//refresh view
				me.reloadActivity();
			}
		});

		//Our contacts/community split makes us dependent on knowing our contacts.
		//Now that the stream is so fast we are often ready to go before we have that info.
		//so if contacts get loaded or refreshed do an update if we are rendered.  Note
		//we don't listen to contacts-updated b/c we don't want to do a lot of work when people add/remove
		//contacts
		this.mon(Ext.getStore('FriendsList'), {
			scope: me,
			'contacts-refreshed': 'maybeReload'
		});

		this.on({
			scope: me,
			'scroll-stopped': 'onScrollStopped'
		});

		me.mixins.activityFilter.setUpMenu.call(me, me.filter);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, {
			scope: this,
			'click': 'itemClick',
			'mouseover': 'itemHover',
			'scroll': 'onScroll'
		});

		this.mon(this.down('box').getEl(), 'scroll', 'viewScrollHandler', this);

		this.itemClickMap = {
			'personalblogentry': this.blogEntryClicked,
			'personalblogcomment': this.blogCommentItemClicked,
			'communityheadlinetopic': this.forumTopicClicked,
			'generalforumcomment': this.forumCommentClicked
		};

		this.addMask();

		this.getTypesMenu().show().hide();

		this.on('resize', function() {
			if (this.el.isMasked()) {
				this.addMask();
			}
		}, this);

		this.mixins.activityFilter.afterRender.apply(this);
	},


	getState: function() {
		return this.mixins.activityFilter.getState.apply(this, arguments);
	},


	applyState: function() {
		return this.mixins.activityFilter.applyState.apply(this, arguments);
	},


	onScroll: function(e, dom) {
		var el = dom.lastChild,
			direction = (this.lastScrollTop || 0) - dom.scrollTop,
			offset = Ext.get(el).getHeight() - Ext.get(dom).getHeight(),
			top = offset - dom.scrollTop;

		//Keep iPad from opening popouts when scrolling
		if (Ext.is.iOS) {
			this.cancelPopupTimeout();
			Ext.defer(function() {
				this.cancelPopupTimeout();
			}, 500, this);
		}

		this.lastScrollTop = dom.scrollTop;

		//if the difference in el and doms height and dom scroll top is zero then we are at the bottom
		if (top <= 20 && direction < 0) {
			this.onScrolledToBottom();
		}
	},


	onScrolledToBottom: Ext.Function.createBuffered(function() {
		this.fetchMore();
	}, 20),


	addMask: function(width, height) {
		var el = this.el && Ext.get(this.el.dom.firstChild),
			mask = this.el && this.el.mask('Loading...');

		if (el && el.getHeight() > 0) {
			mask.setHeight(el.getHeight());
		}
	},


	removeMask: function(width, height) {
		if (this.el) {
			this.el.unmask();
		}
	},


	fetchMore: function() {
		var s = this.store,
			centerButton = this.el.down('.center-button');

		if (!s.hasOwnProperty('data') || s.loading) {
			return;
		}

		this.currentCount = s.getCount();
		if (s.hasAdditionalPagesToLoad()) {
			this.addMask();
			s.clearOnPageLoad = false;
			s.nextPage();
		}
		else {
			if (centerButton) {
				this.el.down('.center-button').remove();
			}
			this.removeMask();
		}
	},


	maybeReload: function() {
		if (this.isVisible() && this.rendered) {
			this.reloadActivity();
		}
	},


	forceRefresh: function(cb) {
		if (this.isVisible() && this.rendered) {
			this.store.on('load', cb, this, {single: true});
			delete this.currentCount;
			this.store.load();
		}
	},


	reloadActivity: function(store) {
		var container = this.down('box[activitiesHolder]'),
			oldestRecord, me = this;

		if (store && !store.isStore) {
			store = null;
		}

		this.store = store = store || this.store;

		this.store.suspendEvents();
		this.store.clearFilter(true);
		this.store.sort();
		//For bonus points tell the user how far back they are asking for
		oldestRecord = this.store.last();

		//this.store.filterBy(this.filterStore, this);
		this.store.resumeEvents();


		if (this.currentCount !== undefined && store.getCount() <= this.currentCount) {
			console.log('Need to fetch again. Didn\'t return any new data');
			delete this.currentCount;
			this.fetchMore();
			return;
		}

		//Did we get anymore for this tab

		if (!this.rendered) {
			this.on('afterrender', this.reloadActivity, this, {single: true});
			return;
		}

		console.log('Redrawing activity panel');

		this.stream = {};

		function groupToLabel(name) {
			return Ext.data.Types.GROUPBYTIME.groupTitle(name, false);
		}

		function doGroup(group) {
			var p = new Promise(),
				label = groupToLabel(group.name);

			function promiseToResolve(agg, c) {
				if (!/deleted/i.test(c.get('ChangeType'))) {
					agg.push(me.changeToActivity(c));
				}
				return agg;
			}
			//wait for the return of changeToActivity for all of the groups childern
			//we need to pool these promises so the label can be added in the right order
			Promise.pool(group.children.reduce(promiseToResolve, []))
				.done(function(results) {
					var parts = [];
					//get rid of any nulls
					results = results.filter(function(i) {return i;});
					//add the label if need be
					if (label) {
						parts = [{ label: label }];
					}
					//add the results to the parts regardless
					parts = parts.concat(results);

					p.fulfill(parts);
				})
				.fail(function(reason) {
					//console.error(reason);
					p.reject(reason);
				});

			return p;
		}

		if (store.getGroups().length === 0 || store.getCount() === 0) {
			Ext.DomHelper.overwrite(container.getEl(), []); //Make sure the initial mask clears
			if (!store.mayHaveAdditionalPages) {
				Ext.DomHelper.overwrite(container.getEl(), {
					cls: 'activity nothing rhp-empty-list',
					cn: ['No Activity, try another filter?']
				});
			}
			container.updateLayout();
		}
		//pool these promises to ensure that the groups get added in the correct order
		Promise.pool(store.getGroups().map(doGroup))
			.done(function(results) {
				results = results.reduce(function(a, b) {
					return a.concat(b);
				}, []);

				me.feedTpl.overwrite(container.getEl(), results);
				container.updateLayout();
			})
			.fail(function(reason) {
				console.error(reason);
			});

		if (store.getCount() > 0 || !store.mayHaveAdditionalPages) {
			this.removeMask();
		}
	},


	passesFilter: function(item) {
		if (!item) {
			return false;
		}
		if (!this.mimeTypes) {
			return true;
		}
		return Ext.Array.contains(this.mimeTypes, item.get('MimeType'));
	},


	changeToActivity: function(c) {
		var me = this, p = new Promise(),
			item = c.get('Item'),
			cid = item ? item.get('ContainerId') : undefined,
			guid = guidGenerator(),
			activity, activityData;

		function getType(item) {
			if (!item) {
				return '';
			}
			var type = item.getModelName().toLowerCase();

			if (item.get('inReplyTo')) {
				type = 'comment';
			}

			return type;
		}

		if (!this.passesFilter(item)) {
			p.fulfill();
			return p;
		}

		activityData = {
			activity: true,
			guid: guid,
			name: c.get('Creator'),
			record: item,
			type: getType(item),
			ContainerId: cid,
			ContainerIdHash: cid ? IdCache.getIdentifier(cid) : undefined
		};

		Promise.pool(this.getMessage(c, cid), UserRepository.getUser(c.get('Creator')))
			.done(function(r) {
				activityData.name = r[1].getName();

				activity = me.stream[guid] = Ext.apply(activityData, r[0]);
				p.fulfill(activity);
			})
			.fail(function(reason) {
				console.error('changeToActivity failed because:', reason);
				p.reject(reason);
			});

		return p;
	},


	getMessage: function(change, cid) {
		var p = new Promise(),
			item = change.get('Item'),
			type = change.get('ChangeType');

		if (!item) {
			result = {message: 'Unknown'};
			p.fulfill(result);
		}

		item.getActivityItemConfig(type, cid)
			.done(function(result) {
				p.fulfill(result);
			})
			.fail(function(reason) {
				console.error('getActivityItemConfig failed because: ', reason, type, item.getModelName(), item, change);
				p.reject('Failed to find a result');
			});

		return p;
	},


	itemClick: function(e) {
		var activityTarget = e.getTarget('div.activity:not(.deleted)', null, true),
			guid, item, rec, me = this, className;

		//For iPad, open popout on long touch, not on click
		if (Ext.is.iOS) {
			this.cancelPopupTimeout();
		}

		guid = (activityTarget || {}).id;
		item = this.stream[guid];
		rec = (item || {}).record;

		if (!rec || rec.get('Class') === 'User') {
			return false;
		}
		e.stopEvent();

		className = rec.get('Class').toLowerCase();

		try {
			if (this.itemClickMap[className]) {
				this.itemClickMap[className].call(this, rec);
			}
			else {
				this.fireEvent('navigation-selected', item.ContainerId, rec);
			}
		}
		catch (er) {
			console.error(Globals.getError(er));
		}
		return false;
	},


	blogEntryClicked: function(rec) {
		var me = this;
		UserRepository.getUser(rec.get('Creator'), function(user) {
			me.fireEvent('navigate-to-blog', user, rec.get('ID'));
		});
	},


	forumTopicClicked: function(rec) {
		if (this.fireEvent('before-show-topic', rec)) {
			this.fireEvent('show-topic-with-action', rec);
		}
	},


	forumCommentClicked: function(rec) {
		var me = this;

		function success(r) {
			if (me.fireEvent('before-show-topic', r)) {
				me.fireEvent('show-topic-with-action', r, rec);
			}
		}

		function fail() {
			console.log('Can\t find forum topic to navigate to', arguments);
		}

		Service.getObject(rec.get('ContainerId'), success, fail, me);

	},


	blogCommentItemClicked: function(rec) {
		var me = this;

		function success(r) {
			UserRepository.getUser(r.get('Creator'), function(user) {
				me.fireEvent('navigate-to-blog', user, r.get('ID'), rec.get('ID'));
			});
		}

		function fail() {
			console.log('Can\t find blog entry to navigate to', arguments);
		}

		Service.getObject(rec.get('ContainerId'), success, fail, me);
	},


	cancelPopupTimeout: function() {
		clearTimeout(this.hoverTimeout);
	},


	onScrollStopped: function() {
		Ext.callback(this.performAfterScrollAction, this);
		delete this.performAfterScrollAction;
	},


	itemHover: function(e) {
		function fn(pop) {
			if (pop) {
				pop.on('destroy', function() {
					delete me.activeTargetDom;
					console.log('Should have cleared the active target..', me);
				}, pop);
			}
		}

		if (this.isScrolling && !Ext.is.iOS) {
			this.performAfterScrollAction = Ext.bind(this.itemHover, this, arguments);
			return;
		}
		var me = this,
			target = e.getTarget('div.activity', null, true),
			guid = (target || {}).id,
			item = me.stream[guid],
			rec = (item || {}).record,
			popout = NextThought.view.account.activity.Popout;


		if (rec && rec.getClassForModel) {
			popout = rec.getClassForModel('widget.activity-popout-', NextThought.view.account.activity.Popout);
		}

		if (!rec || me.activeTargetDom === Ext.getDom(target)) {
			return;
		}

		me.cancelPopupTimeout();
		me.hoverTimeout = Ext.defer(function() {
			target.un('mouseout', me.cancelPopupTimeout, me, {single: true});
			popout.popup(rec, target, me, undefined, fn);
			me.activeTargetDom = Ext.getDom(target);
		}, 500);

		target.on('mouseout', me.cancelPopupTimeout, me, {single: true});
	},


	viewScrollHandler: function(e) {
		//NOTE: we want to avoid trying to display the popup while the user is scrolling.
		var me = this;
		clearTimeout(me.scrollingTimer);
		me.isScrolling = true;
		me.scrollingTimer = Ext.defer(function() {
			me.isScrolling = false;
			me.fireEvent('scroll-stopped');
		}, 500);
	},


	//Right now things in the contacts are things shared
	//directly to you, or creators that are connected to you.  Circled change
	//also belong here.
	belongsInMyContacts: function(change, flStore, communities, noVerify) {
		var belongs = false,
			username = $AppConfig.username,
			item = change.get('Item'),
			sharedWith = item.get('sharedWith') || [],
			creator = item.get('Creator');

		if (/circled/i.test(change.get('ChangeType'))) {
			belongs = true;
		}

		belongs = belongs || Ext.Array.contains(sharedWith, username);
		if (!belongs && flStore && flStore.isConnected) {
			belongs = flStore.isConnected(creator);
		}

		//Just log an error for now so we know there isn't
		//a missing condition we didn't consider
		if (!noVerify && !belongs && !this.belongsInCommunity(change, flStore, communities, true)) {
			console.error('Danger, dropping change that does not pass either filter', change);
		}
		return belongs;
	},

	//FIXME: There is no community tab anymore, it is intended to be everything in the stream.
	//When we made that change we fixed one place filtering was happening but we didn't ever
	//Fix the logic here.  This is a quick and dirty fix (setting accepted=true) but the filtering
	//strategy needs to be cleaned up
	//If there is a community in the shared with list
	//it goes in the community tag
	belongsInCommunity: function(change, flStore, communities, noVerify) {
		var item = change.get('Item'),
			sharedWith = item.get('sharedWith') || [],
			accepted = true, belongsInContacts;


		//Just log an error for now so we know there isn't
		//a missing condition we didn't consider
		belongsInContacts = this.belongsInMyContacts(change, flStore, communities, true);
		if (!noVerify && !accepted && !belongsInContacts) {
			console.error('Danger, dropping change that does not pass either filter', change);
		}

		//If it belongs in our contacts, it's also game.
		return accepted || belongsInContacts;
	},


	filterStore: function(change) {
		var communities = ($AppConfig.userObject.getCommunities() || []),
			community = (this.filter === 'inCommunity'),
			flStore = Ext.getStore('FriendsList'),
			me = this, communityNames = [];

		//Filter out "Modified" change events for community headline
		//topics.  See trello 1269
		function filterModifiedTopics(c) {
			if (!c) {
				return true;
			}
			var type = c.get('ChangeType') || '',
				item = c.get('Item'), mime;

			if (item && (/modified/i).test(type)) {
				mime = item.get('MimeType');
				if (mime &&
					((/.*?communityheadlinetopic$/i).test(mime) || (/.*?personalblogentry$/i).test(mime))) {
					return false;
				}
			}

			return true;
		}

		if (!filterModifiedTopics(change)) {
			return false;
		}

		// Strip away all DFL in communities.
		Ext.each(communities, function(c) {
			if (c.isCommunity) {
				communityNames.push(c.get('Username'));
			}
		});

		if (community) {
			return me.belongsInCommunity(change, flStore, communityNames);
		}

		return me.belongsInMyContacts(change, flStore, communityNames);
	},


	getStore: function() {
		return this.store;
	},


	getActiveView: function() {
		return this;
	},


	applyFilters: function(mimeTypes) {
		if (Ext.isEmpty(mimeTypes)) {
			return;
		}


		this.mimeTypes = mimeTypes;

		var s = this.getStore(),
			accepts = mimeTypes.join(','),
			extras = s.proxy.extraParams || {},
			current = extras.accept || '';

		if (current !== accepts) {
			s.removeAll();
			s.proxy.extraParams = Ext.apply(extras, { accept: accepts });
			this.addMask();
			s.load();
		}
	}

});

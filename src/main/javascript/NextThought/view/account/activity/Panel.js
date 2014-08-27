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
		'NextThought.model.forums.HeadlineTopic',
		'NextThought.model.openbadges.Badge'
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
			html: '{{{NextThought.view.account.activity.Panel.no-activity}}}'
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
			filter: this.filter,
			filterOperator: '1'
		}));

		this.mon(Ext.getStore('Stream'), {
			add: function(s, changes) {
				me.store.add(changes);
			}
		});

		this.mon(me.store, {
			scope: me,
			load: 'maybeReload',
			datachanged: 'maybeReload',
			update: 'maybeReload'
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
			'generalforumcomment': this.forumCommentClicked,
			'contentcommentpost': this.forumCommentClicked
		};

		this.addMask();

		this.getTypesMenu().show().hide();

		this.on({
			resize: function() {
				if (this.el.isMasked()) {
					this.addMask();
				}
			},
			show: { fn: 'redrawIfDirty', buffer: 10 }
		});

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


	redrawIfDirty: function() {
		if (this.viewIsDirty) {
			delete this.viewIsDirty;
			this.maybeReload();
		}
	},


	maybeReload: function() {
		if (this.isVisible() && this.rendered) {
			this.reloadActivity();
		} else {
			this.viewIsDirty = true;
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
			groups, me = this;

		if (store && !store.isStore) {
			store = null;
		}

		this.store = store = store || this.store;

		this.store.suspendEvents();
		this.store.clearFilter(true);
		this.store.sort();
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
			var label = groupToLabel(group.name);

			function resolve(c) {
				if (!/deleted/i.test(c.get('ChangeType'))) {
					return me.changeToActivity(c);
				}
			}

			//wait for the return of changeToActivity for all of the groups childern
			//we need to pool these promises so the label can be added in the right order
			return Promise.all(group.children.map(resolve).filter(Ext.identityFn))
					.then(function(results) {
						var parts = [];

						results = results.filter(Ext.identityFn);

						if (results.length) {
							//add the label if need be
							if (label) {
								parts = [{ label: label }];
							}
							//add the results to the parts regardless
							parts = parts.concat(results);
						}

						return parts;
					});
		}

		groups = store.getGroups();
		if (groups.length === 0 || store.getCount() === 0) {
			Ext.DomHelper.overwrite(container.getEl(), []); //Make sure the initial mask clears
			if (!store.mayHaveAdditionalPages) {
				Ext.DomHelper.overwrite(container.getEl(), {
					cls: 'activity nothing rhp-empty-list',
					cn: [getString('NextThought.view.account.activity.Panel.empty-activity')]
				});
			}
			container.updateLayout();
		}

		function maybeClearMask() {
			if (store.getCount() > 0 || (!store.mayHaveAdditionalPages && !store.loading)) {
				me.removeMask();
			}
		}


		//pool these promises to ensure that the groups get added in the correct order
		Promise.all(groups.map(doGroup))
			.done(function(results) {
				results = results.reduce(function(a, b) {
					return a.concat(b);
				}, []);

				me.feedTpl.overwrite(container.getEl(), results);
				maybeClearMask();
				container.updateLayout();
			})
			.fail(function(reason) {
				maybeClearMask();
				console.error(reason);
			});
	},


	passesFilter: function(item) {
		if (!item) {
			return false;
		}
		if (!this.mimeTypes || this.mimeTypes[0] === '*/*') {
			return true;
		}
		return Ext.Array.contains(this.mimeTypes, item.get('MimeType'));
	},


	changeToActivity: function(c) {
		var me = this,
			item = c.getItem(),
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
			return Promise.resolve();
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


		return Promise.all([
			me.getMessage(c, cid),
			UserRepository.getUser(c.get('Creator'))
		])
			.done(function(r) {
				activityData.name = r[1].getName();
				activity = me.stream[guid] = Ext.apply(activityData, r[0]);
				return activity;
			})
			.fail(function(reason) {
				console.error('changeToActivity failed because:', reason);
				throw reason;
			});
	},


	getMessage: function(change, cid) {
		var item = change.getItem(),
			type = change.get('ChangeType');

		if (!item) {
			return Promise.resolve({message: 'Unknown'});
		}

		if (!item.getActivityItemConfig) {
			return Promise.resolve({message: item.$className + ': Type not implemented'});
		}

		return item.getActivityItemConfig(type, cid);
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
			AnalyticsUtil.addContext('RHP', true);
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
		UserRepository.getUser(rec.get('Creator'))
				.then(function(user) {
					me.fireEvent('navigate-to-blog', user, rec.get('ID'));
				});
	},


	forumTopicClicked: function(rec) {
		this.fireEvent('show-topic', this, rec);
	},


	forumCommentClicked: function(rec) {
		var me = this;

		function success(r) {
			me.fireEvent('show-topic', me, r, rec);
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


	filterStore: function(change) {
		//Filter out "Modified" change events for community headline
		//topics.  See trello 1269
		function filterModifiedTopics(c) {
			if (!c) {
				return true;
			}
			var type = c.get('ChangeType') || '',
				item = c.getItem(), mime;

			if (item && (/modified/i).test(type)) {
				mime = item.get('MimeType');
				if (mime &&
					((/.*?communityheadlinetopic$/i).test(mime) || (/.*?personalblogentry$/i).test(mime))) {
					return false;
				}
			}

			return true;
		}

		return filterModifiedTopics(change);
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

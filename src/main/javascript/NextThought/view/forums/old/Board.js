/**
 * https://docs.google.com/a/nextthought.com/presentation/d/18qyM3011F_AXjwAPGpE-94DPKmuPPPnKQ0EepyAoXmQ/edit#slide=id.g9418ebe4_053
 *
 *
 * This will contain a list of Forums.
 *
 * When a user selects one we will add that view (Forum) onto the stack, suppressing this one. (The stack and impl
 * to be handled in the controller)
 */
Ext.define('NextThought.view.forums.old.Board', {
	extend: 'Ext.view.View',
	alias: ['widget.forums-board', 'widget.forums-forum-list'],
	mixins: {
		HeaderLock: 'NextThought.view.forums.mixins.HeaderLock'
	},
	requires: [
		'NextThought.util.Time'
	],

	cls: 'forum-list list scrollable',
	itemSelector: '.forum-list-item',
	preserveScrollOnRefresh: true,
	loadMask: false,
	scrollParentCls: '.forums-view',

	listeners: {
		select: function(selModel, record) {
			//allow reselect since we don't style the selected state, this has no
			// visual effect other than the ability to click on it again
			selModel.deselect(record);
		}
	},

	headerTpl: Ext.DomHelper.createTemplate({
		cls: 'header-container', cn: {
			cls: 'forum-forum-list header', cn: [
				{ cls: 'controls', cn: [
					{ cls: 'new-forum', html: 'New Forum'}
				]},
				{ cls: 'path', cn: ['{path} / ', {tag: 'span', cls: 'title-part', html: '{title}'}]}
			]
		}
	}),

	tpl: Ext.DomHelper.markup({
		tag: 'tpl', 'for': '.', cn: [
			{ cls: 'forum-list-item', cn: [
				{ tag: 'tpl', 'if': 'title == \'Forum\'', cn: { cls: 'title', html: '{Creator} / {title}' } },
				{ tag: 'tpl', 'if': 'title != \'Forum\'', cn: { cls: 'title', html: '{title}' } },
				{ tag: 'tpl', 'if': 'description', cn: { cls: 'description', html: '{description}'} },
				{ cls: 'meta', cn: [
					{ tag: 'span', cls: 'count', html: '{TopicCount:plural(parent.kind)}' },
					{ tag: 'tpl', 'if': '!values[\'NewestDescendant\']', cn: [
						{ tag: 'span', cls: 'descendant', html: 'Created {[TimeUtils.timeDifference(new Date(),values["CreatedTime"])]}'}
					]},
					{ tag: 'tpl', 'if': 'values[\'NewestDescendant\']', cn: [
						{ tag: 'span', cls: 'descendant', cn: [
							'Last Active {[TimeUtils.timeDifference(new Date(), values["NewestDescendant"].get("Last Modified"))]} by ',
							{tag: 'span', cls: 'name link', html: '{[values["NewestDescendant"].get("Creator")]}'}
						]}
					]},
					{ tag: 'tpl', 'if': 'isFeature(\'mutable-forums\') && !Ext.isEmpty(values.Links.getLinksForRel(\'edit\'))', cn: [
						{ tag: 'span', cls: 'edit', html: 'Edit'}
					]}
				]}
			]}
		]
	}),


	collectData: function() {
		var r = this.callParent(arguments);
		r.kind = 'Discussion';
		return r;
	},


	canCreateForum: function() {
		return isFeature('mutable-forums') && this.record.getLink('add');
	},

	//the forum creation window will call this when a forum is created or edited
	onSaveSuccess: function() {
		this.fillInNewestDescendant();
	},


	fillInNewestDescendant: function() {
		var map = {}, me = this;
		this.store.each(function(r) {
			var desc = r.get('NewestDescendant'),
				creator = desc ? desc.get('Creator') : undefined;

			if (creator && !creator.isModel) {
				if (Ext.isArray(map[creator])) {
					map[creator].push(r);
				}
				else {
					map[creator] = [r];
				}
			}
		});

		function apply(resolvedUser, i) {
			var recs = map[resolvedUser.get('Username')] || [];
			Ext.each(recs, function(rec) {
				var desc = rec.get('NewestDescendant'),
					recIdx = -1;
				if (desc) {
					desc.set('Creator', resolvedUser);
					//When a field is another model object and one of it's properties change,
					//the containing object won't see the change right now.  One would think
					//you could set back the same field, but since they are equivalent nothing
					//happens.  So, until we have a framework in place for this force this particular
					//node to update.  We wouldn't get here if it wasn't changing anyway
					recIdx = me.store.indexOf(rec);
					if (recIdx > -0) {
						me.refreshNode(recIdx);
					}
				}
			});
		}

		UserRepository.getUser(Ext.Object.getKeys(map), function(users) {
			me.store.suspendEvents(true);
			Ext.each(users, apply);
			me.store.resumeEvents();
		});
	},


	initComponent: function() {
		//this.mixins.HeaderLock.constructor.call(this);
		this.callParent(arguments);
		this.on('refresh', this.fillInNewestDescendant, this);
	},


	afterRender: function() {
		var newForum;
		this.callParent(arguments);
		if (!this.isRoot) {
			this.headerElContainer = this.headerTpl.append(this.el, { path: this.record.get('Creator'), title: this.record.get('title') }, true);
			this.headerEl = this.headerElContainer.down('.header');

			if (!this.canCreateForum()) {
				newForum = this.headerEl.down('.new-forum');
				if (newForum) {
					newForum.remove();
				}
			}

			this.scrollParent = this.el.parent(this.scrollParentCls);
			if (this.scrollParent) {
				this.mon(this.scrollParent, 'scroll', 'onScroll', this);
			} else {
				console.error('Could not listen on scroll for this view.');
			}

			this.on({
				headerEl: {click: 'onHeaderClick'},
				activate: 'onActivate',
				itemclick: 'onItemClick',
				beforeitemclick: 'onBeforeItemClick'
			});
		}
	},


	onActivate: function() {
		var s = this.store;
		//console.log('The board view is activated');
		//Sort them by last modified
		//	s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, {
		//		sortOn: 'Last Modified',
		//		sortOrder: 'descending'
		//	});
		//Don't sort them by creation time on client side either
		// s.sorters.clear();
		this.mon(s, 'load', function(store, records) {
				//make sure we can scroll
				this.ownerCt.el.unmask();

				if (this.getHeight() < this.ownerCt.getHeight()) {
					this.fetchNextPage();
				}
		}, this);

		s.loadPage(1);
	},


	onScroll: function(e, dom) {
		if (!this.isVisible()) {
			return;
		}

		var el = dom.lastChild,
			direction = (this.lastScrollTop || 0) - dom.scrollTop,
			offset = Ext.get(el).getHeight() - Ext.get(dom).getHeight(),
			top = offset - dom.scrollTop;

		this.lastScrollTop = dom.scrollTop;

		if (top <= 20 && direction < 0) {
			this.fetchNextPage();
		}
	},


	fetchNextPage: function() {
		var s = this.store, max;

		if (!s.hasOwnProperty('data')) {
			return;
		}

		max = s.getPageFromRecordIndex(s.getTotalCount() - 1);
		if (s.currentPage < max && !s.isLoading()) {
			this.ownerCt.el.mask('Loading...');
			s.clearOnPageLoad = false;
			s.nextPage();
		}
	},


	onHeaderClick: function(e) {
		if (e.getTarget('.path')) {
			this.fireEvent('pop-view', this);
		}
		else if (e.getTarget('.new-forum')) {
			this.fireEvent('new-forum', this);
		}
	},


	onItemClick: function(record) {
		this.fireEvent('show-topic-list', this, record);
	},


	onBeforeItemClick: function(record, item, idx, event, opts) {
		var t = event && event.getTarget && event.getTarget(),
			edit = t && event.getTarget('.edit'),
			d = record.get && record.get('NewestDescendant'),
			topicHref;

		if (edit) {
			if (event && event.stopEvent) {
				event.stopEvent();
			}
			this.fireEvent('new-forum', this, record);
			return false;
		}

		function isDescendantClick(tar) {
			if (!tar) {
				return false;
			}

			var target = Ext.fly(tar),
				sel = '.descendant';

			return target.is(sel) || target.parent(sel, true);
		}

		if (d && t && isDescendantClick(t)) {
			if (this.processingDescendant) {
				return false;
			}
			console.log('Need to show newest descendant', d);

			if (d.isPost) {
				Service.getObject(d.get('ContainerId'),
					function(o) {
						this.fireEvent('show-topic', o, d.isComment ? d.get('ID') : undefined);
						delete this.processingDescendant;
					},
					function() {
						console.error('An error occurred navigating to newest descendant', arguments);
						delete this.processingDescendant;
					},
					this);
			}
			else if (d.isTopic) {
				this.processingDescendant = true;
				this.fireEvent('show-topic', d);
				delete this.processingDescendant;
			}
			else {
				console.warn('Unknown newest descendant', d);
			}

			return false;
		}
	}
});

Ext.define('NextThought.view.content.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.content-view-container',
	requires: [
		'NextThought.view.reader.Panel',
		'NextThought.view.course.View',
		'NextThought.view.course.dashboard.View',
		'NextThought.view.course.forum.View',
		'NextThought.view.course.info.View',
		'NextThought.view.course.overview.parts.ContentLink'
	],

	layout: {
		type: 'card',
		deferredRender: true
	},
	defaultType: 'box',
	activeItem: 'course-book',

	items: [
		{
			title: 'Dashboard',
			id: 'course-dashboard',
			xtype: 'course-dashboard'
		},{
			id: 'course-book',
			xtype: 'container',
			layout: {
				type: 'card',
				deferredRender: true
			},
			activeItem: 'main-reader-view',
			items: [{
				xtype: 'course',
				id: 'course-nav'

			},{
				id: 'main-reader-view',
				xtype: 'reader'
			}]
		},{
			title: 'Discussion',
			id: 'course-forum',
			xtype: 'course-forum'
		},
		{
			title: 'Course Info',
			id: 'course-info',
			xtype: 'course-info'
		}
	],


	tabSpecs: [
		{label: 'Dashboard', viewId: 'course-dashboard'},
		{label: 'Lessons', viewId: 'course-book?'},
    //		{label: 'Assignments', viewId: ''},
		{label: 'Discussions', viewId: 'course-forum'},
    //		{label: 'Notebook', viewId: ''},
		{label: 'Course Info', viewId: 'course-info'}
	],


	initComponent: function() {
		this.callParent(arguments);
		this.reader = this.down('reader-content');
		this.courseBook = this.down('#course-book');
		this.courseDashboard = this.down('course-dashboard');
		this.courseForum = this.down('course-forum');
		this.courseNav = this.down('course');
		this.courseInfo = this.down('course-info');

		this.removeCls('make-white');

		this.courseNav.makeListenForCourseChange([
			this.courseDashboard,
			this.courseForum,
			this.courseInfo
		]);

		this.courseNav.mon(this.reader, {'navigateComplete': 'onNavigateComplete'});

		this.mon(this.reader, {
			'navigateComplete': 'onNavigateComplete',
			'beforeNavigate': 'onBeforeNavigate',
			'navigateAbort': 'onNavigationAborted',
			'navigateCanceled': 'onNavigationCanceled'
		});

		this.mon(this.courseForum, {
			scope: this,
			'set-active-state': 'updateActiveState'
		});

		this.on({
			'switch-to-reader': 'switchViewToReader',
			'beforeactivate': 'onBeforeActivation',
			'beforedeactivate': 'onBeforeDeActivation',
			'deactivate': 'onDeactivated',
			'activate': 'onActivated',
			'main-tab-clicked': 'onTabClicked'
		});
	},

	updateActiveState: function(type, ntiid) {
		var state = {};
		state['current_' + type] = ntiid;
		this.pushState(state);
	},


	onTabClicked: function(tabSpec) {
		var active = this.layout.getActiveItem(),
			targetView = /^([^\?]+)(\?)?$/.exec(tabSpec.viewId) || [tabSpec.viewId],
			vId = targetView[1],
			needsChanging = vId !== active.id,
			//only reset the view if we are already there and the spec flagged that it can be reset.
			reset = !!targetView[2] && !needsChanging;

		if (Ext.isEmpty(vId)) {
			return false;
		}

		if (needsChanging) {
			this.setActiveTab(vId);
			this.pushState({activeTab: vId});
		} else if (reset) {

			//should build in some smarts about allowing this to toggle through if the views are 'ready'
			active = active.layout.setActiveItem(0);
			if (active) {
				//hack 2 for demo
				try {
					active = active.down('course-outline').getSelectionModel().getSelection()[0];
					if (active) {
						this.fireEvent('set-location', active.getId());
					}
				}
				catch (e) {
					console.error('error', e);
				}
			}
		}

		return true;
	},


	pushState: function(s) {
		history.pushState({content: s}, this.title, this.getFragment());
	},


	getTabs: function() {
		var tabs = this.tabSpecs,
			tabSet = Ext.isArray(this.tabs) ? this.tabs : [],
			active = this.layout.getActiveItem().id;

		if (this.tabs) {

			if (!this.courseForum.hasBoard) {
				tabs = Ext.Array.filter(tabs, function(i) {return i.viewId !== 'course-forum';});
			}

			if (!this.courseInfo.hasInfo) {
				tabs = Ext.Array.filter(tabs, function(i) {return i.viewId !== 'course-info';});
			}

			if (Ext.isArray(this.tabs)) {
				tabs = Ext.Array.filter(tabs, function(i) { return Ext.Array.contains(tabSet, i.viewId); });
			}
		}

		Ext.each(tabs, function(t) {
			t.selected = (t.viewId.replace(/\?$/, '') === active);
		});

		return this.tabs ? tabs : [];
	},


	onBeforeActivation: function() {
		if (this.reader.activating) {
			this.reader.activating();
		}
	},


	onDeactivated: function() {
		var CQ = Ext.ComponentQuery, active,
			needsClosing = []
					.concat(CQ.query('slidedeck-view'))
					.concat(CQ.query('note-window'));

		Ext.Array.map(needsClosing, function(c) {c.destroy();});

		active = this.getLayout().getActiveItem();
		if (active) {
			active.fireEvent('deactivate', this);
		}
	},


	onNavigationAborted: function(resp, ntiid, finish) {
		function fin(cid, locationInfo) {
			if (!cid) {
				me.courseBook.layout.setActiveItem('main-reader-view');
				me.reader.setSplash();
				me.reader.relayout();
				me.down('content-toolbar').hide();
				me.down('content-page-widgets').hide();
			}
			else {
				if (locationInfo.location && locationInfo.location.tagName === 'content:related') {
					// NOTE: For content related item, we have enough info to actually show it, otherwise,
					// we will navigation to the parent container.
					$AppConfig.service.getPageInfo(cid, function(pi) {
						if (!Ext.isEmpty(pi)) {
							pi = Ext.isArray(pi) ? pi[0] : pi;

							me.reader.setLocation(pi, function(s) {
								function fn() {
									if (!courseNav) { return; }
									courseNav.fireEvent('select-card-node', locationInfo.NTIID);
									Ext.callback(finish);
								}
								//
								var courseNav = me.courseNav;
								if (!courseNav.rendered) {
									courseNav.on('afterrender', fn);
									return;
								}
								fn();
							});
							return;
						}

						//We know the we are trying to navigate to a content card but we couldn't resolve its pageInfo?,
						// callback and return.
						Ext.callback(finish);
					});

					// Return false, since we can handle this.
					return false;
				}
				me.fireEvent('navigation-selected', cid);
			}
			return true;
		}

		var me = this;
		if (this.fireEvent('navigation-failed', this, ntiid, resp) !== false) {
			if (resp && resp.status === 404) {
				return ContentUtils.findRelatedContentObject(ntiid, fin, me);
			}
			fin();
		}
	},


	onBeforeDeActivation: function() {
		// NOTE: we should probably fire this event for all the children of this view,
		// since one could have the editor active (in which case we would want to display appropriate warning).
		// For now, it seems like the reader should be notified and we will add others if we find it necessary.
		var result = true, active;
		result = this.reader.fireEvent('beforedeactivate', this);
		if (result) {
			active = this.getLayout().getActiveItem();
			if (active) {
				result = active.fireEvent('beforedeactivate', this);
			}
		}
		return result;
	},


	onActivated: function() {
		var active = this.getLayout().getActiveItem();
		if (active) {
			active.fireEvent('activate', this);
		}
	},


	onBeforeNavigate: function(ntiid, fromHistory) {
		if (!fromHistory) {
			if (this.activate(true) === false) {
				return false;
			}
		}
		if (this.reader.iframeReady) {
			return true;
		}

		this.reader.ntiidOnFrameReady = ntiid;
		return false;
	},


	onNavigationCanceled: function(ntiid, alreadyThere, fromHistory) {
		if (!alreadyThere || fromHistory) { return; }
		this.setActiveTab('course-book');
		this.pushState({activeTab: 'course-book'});
	},


	onNavigateComplete: function(pageInfo, cb, userInitiatedNav) {
		if (!pageInfo || !pageInfo.isModel) {return;}
		var l = ContentUtils.getLocation(pageInfo), toc;

		if (l && l !== ContentUtils.NO_LOCATION) {
			toc = l.toc.querySelector('toc');
		}

		this.tabs = pageInfo.isPartOfCourse();
		if (this.tabs && !Ext.query('course unit', l.toc).length) {
			this.tabs = ['course-info'];
		}

		if (this.isVisible(true)) {
			this.fireEvent('update-tabs', this);
		}

		if (userInitiatedNav || !this.tabs || Ext.isArray(this.tabs)) {
			try {
				this.getLayout().setActiveItem(
						Ext.isArray(this.tabs) ? this.courseInfo : this.courseBook);

			}catch (e) {
				console.warn(e.stack || e.message);
			}
		}

		this.courseBook.getLayout().setActiveItem(pageInfo.isPartOfCourseNav() ? 'course-nav' : 'main-reader-view');


		this.down('content-toolbar').show();


		this.locationTitle = ContentUtils.findTitle(pageInfo.getId(), 'NextThought');
		this.setTitle(this.getTitlePrefix() + this.locationTitle);




		if (toc) {
			this.backgroundUrl = getURL(toc.getAttribute('background'), l.root);
			if (this.isActive()) {
				this.updateBackground();
			}
		}
	},


	getTitlePrefix: function() {
		var prefix = this.getLayout().getActiveItem().title || '';
		if (!Ext.isEmpty(prefix)) {
			prefix += ' - ';
		}
		return prefix;
	},


	switchViewToReader: function() {
		this.courseBook.layout.setActiveItem('main-reader-view');
	},


	setActiveTab: function(tab) {
		if (this.rendered) {
			this.layout.setActiveItem(tab || 'course-book');
			this.setTitle(this.getTitlePrefix() + this.locationTitle);
		} else {
			this.on('afterrender', function() {
				this.layout.setActiveItem(tab);
			}, this);
		}
	},


	restore: function(state) {
		var ntiid = state.content.location,
			tab = state.content.activeTab,
			topic = state.content.current_topic,
			forum = state.content.current_forum;

		try {
			this.setActiveTab((tab === 'null') ? null : tab);
			if (!ntiid) {
				console.warn('There was no ntiid to restore!');
				return;
			}

			this.courseForum.restoreState(forum, topic);

			this.reader.setLocation(ntiid, null, true);
			this.up('master-view').down('library-collection').updateSelection(ntiid, true);
		}
		catch (e) {
			console.error(e.message, '\n\n', e.stack || e.stacktrace || e, '\n\n');
		}
		finally {
			this.fireEvent('finished-restore');
		}
	},


	activate: function() {
		var res = this.callParent(arguments);
		if (res) {
			this.reader.relayout();
		}
		return res;
	},


	getFragment: function() {
		var o;

		if (this.layout.getActiveItem().id === 'course-book') {
			o = ParseUtils.parseNTIID(this.reader.getLocation().NTIID);
		}
		return o ? o.toURLSuffix() : location.pathname;
	}
});

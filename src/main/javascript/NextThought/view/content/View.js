Ext.define('NextThought.view.content.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.content-view-container',
	requires: [
		'NextThought.view.reader.Panel',
		'NextThought.view.courseware.View',
		'NextThought.view.courseware.dashboard.View',
		'NextThought.view.courseware.forum.View',
		'NextThought.view.courseware.info.View',
		'NextThought.view.courseware.overview.parts.ContentLink'
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
			}],
			listeners: {
				'beforedeactivate': function() {
					var active = this.layout && this.layout.activeItem;
					if (active) {
						return active.fireEventArgs('beforedeactivate', arguments);
					}
					return true;
				}
			}
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
		this.courseDash = this.down('course-dashboard');
		this.courseForum = this.down('course-forum');
		this.courseNav = this.down('course');
		this.courseInfo = this.down('course-info');

		this.removeCls('make-white');

		this.mon(this.reader, {
			'navigateComplete': 'onNavigateComplete',
			'beforeNavigate': 'onBeforeNavigate',
			'navigateAbort': 'onNavigationAborted',
			'navigateCanceled': 'onNavigationCanceled',

			'location-cleared': 'onLocationCleared'
		});

		this.mon(this.courseForum, {
			scope: this,
			'set-active-state': 'updateActiveState'
		});

		this.on({
			'switch-to-reader': 'showContentReader',
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
		history.pushState({active: 'content', content: s}, this.title, this.getFragment());
	},


	/**
	 * @param {Boolean|String[]} enable
	 */
	enableTabs: function(enable) {
		this.tabs = enable;
		this.updateTabs();
	},


	updateTabs: function() {
		if (this.isVisible(true)) {
			this.fireEvent('update-tabs', this);
		}
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

		//Make sure we still have the content we are trying to get to in the library
		//If not maybe it's a purchasable we can show
		//TODO: find a way to let the dataserver fail this action so we go through the
		//normal 403 handling.  One idea could be to force a PageInfo fetch here?  That's
		//tricky because its async
		var location = this.reader.getLocation(),
			contentNtiid = location && location.ContentNTIID,
			title = Library.getTitle(contentNtiid);

		if (contentNtiid && !title && location) {
			//we are being asked to switch to something which we no longer
			//have in the library.  We may have recently have lost access to it.
			//Maybe its a purchasable we can prompt them with
			this.fireEvent('unauthorized-navigation', this, location.NTIID);
			return false;
		}
		return true;
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


	// Add a way to explicitly select a card node rather
	// than going through the originalNTIIDRequested Hack
	openCardNode: function(ntiid) {
		var card, i;

		Ext.each(this.query('content-card'), function(crd) {
			i = crd.data && crd.data.ntiid;
			if (i === ntiid) {
				card = crd;
			}
			return !card;
		});

		if (card && card.navigateToTarget) {
			card.navigateToTarget();
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
									Ext.defer(me.openCardNode, 1, me, [locationInfo.NTIID]);
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


	onLocationCleared: function() {
		delete this.reader.ntiidOnFrameReady;
		this.setActiveTab('course-book');
		this.courseBook.getLayout().setActiveItem('main-reader-view');
	},


	onNavigationCanceled: function(ntiid, alreadyThere, fromHistory) {
		if (!alreadyThere || fromHistory) { return; }

		var tab = Ext.isArray(this.tabs) ? 'course-info' : 'course-book';

		this.setActiveTab(tab);
		this.pushState({activeTab: tab});
	},


	onNavigateComplete: function(pageInfo) {
		if (!pageInfo || !pageInfo.isModel) {return;}

		this.down('content-toolbar').show();

		//TEMP:
		if (pageInfo.isPartOfCourseNav()) {
			this.showCourseNavigation();
		}
		else {
			this.showContentReader();
		}

		this.locationTitle = pageInfo.getTitle('NextThought');
		this.setTitle(this.getTitlePrefix() + this.locationTitle);
	},


	_setCourse: function(instance) {
		if (this.currentCourse === instance) {
			return;
		}

		//Temporary stop gap
		var info = instance && instance.__getLocationInfo(),
			catalogEntry = instance && instance.getCourseCatalogEntry(),
			preview = catalogEntry && catalogEntry.get('Preview'),
			background = info && getURL(info.toc.querySelector('toc').getAttribute('background'), info.root);

		this.currentCourse = instance;
		this.reader.clearLocation();

		this.setBackground(background);
		this.enableTabs(preview ? [] : !!instance);


		Ext.each([
			this.courseNav,
			this.courseDash,
			this.courseForum,
			this.courseInfo
		], function(e) {
			if (e.courseChanged) {
				e.courseChanged(instance);
			}
		});

		this.updateTabs();
		if (instance) {
			this.showCourseNavigation();
		} else {
			this.showContentReader();
		}

		this.setActiveTab(preview ? 'course-info' : 'course-book');
	},


	onCourseSelected: function(instance) {
		this._setCourse(instance);

		var e = instance.getCourseCatalogEntry();

		history.pushState({
			active: 'content',
			content: {
				location: e.get('ContentPackageNTIID'),
				course: instance.getId()
			}
		}, e.get('Title'));
	},


	showCourseNavigation: function() {
		this.courseBook.getLayout().setActiveItem('course-nav');
		this.setActiveTab('course-book');
	},


	showContentReader: function() {
		this.courseBook.layout.setActiveItem('main-reader-view');
		this.setActiveTab('course-book');
	},


	setBackground: function(src) {
		this.backgroundUrl = src;
		if (this.isActive()) {
			this.updateBackground();
		}
	},


	getTitlePrefix: function() {
		var prefix = this.getLayout().getActiveItem().title || '';
		if (!Ext.isEmpty(prefix)) {
			prefix += ' - ';
		}
		return prefix;
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
		var st = state.content,
			course = st.course,
			ntiid = st.location,
			tab = st.activeTab,
			topic = st.current_topic,
			forum = st.current_forum,
			me = this;

		function setupCourseUI(instance) {
			try {
				if (instance) {
					me._setCourse(instance);
					me.courseForum.restoreState(forum, topic);
				}

				me.setActiveTab((tab === 'null') ? null : tab);
				if (ntiid) {
					me.reader.setLocation(ntiid, null, true);
				} else {
					me.reader.clearLocation();
				}
			}
			catch (e) {
				console.error(e.stack || e.message || e);
			}
			finally {
				me.fireEvent('finished-restore');
			}
		}

		function noCourse() {
			console.warn('Dropping state for course that is not accessible.');
			me.fireEvent('finished-restore');
			if (state.active === me.id) {
				me.fireEvent('go-to-library');
			}
		}

		me.resolveCourse(course).then(setupCourseUI, noCourse);
	},


	resolveCourse: function(courseInstanceId) {
		var promise = new Promise();

		if (courseInstanceId) {
			promise = Ext.getStore('courseware.EnrolledCourses').getCourse(courseInstanceId);
		} else {
			promise.fulfill(undefined);
		}

		return promise;
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

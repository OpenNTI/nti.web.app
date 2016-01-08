Ext.define('NextThought.app.library.courses.components.available.CoursePage', {
	extend: 'NextThought.app.library.courses.components.Page',
	alias: ['widget.library-availalble-courses-page'],

	cls: 'page scrollable',

	defaultType: 'course-catalog-collection',

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],

	tabTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'tab{[values.active ? " active" : ""]}', 'data-category': '{category}', 'data-title': '{label}', html: '{label}'
	})),

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'tabs' },
		{ id: '{id}-body', cls: 'body-container',
			cn: ['{%this.renderContainer(out,values)%}'] 
		}
	]),


	renderSelectors: {
		tabsEl: '.tabs'
	},


	getCourseStore: function(data) {
		return new Ext.data.Store({
			model: 'NextThought.model.courses.CourseCatalogEntry',
			data: data,
			sorters: [{property: 'ProviderUniqueID', direction: 'ASC'}]
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		var me = this;

		this.setPageHeight();
		this.bufferedScroll = Ext.Function.createBuffered(this.onScroll, 100);
		this.mon(this.getTargetEl(), 'scroll', this.bufferedScroll.bind(this));
		this.mon(this.tabsEl, 'click', this.onTabClick.bind(this));
		Ext.EventManager.onWindowResize(this.setPageHeight, this);
		me.on('destroy', function() {
			Ext.EventManager.removeResizeListener(me.setPageHeight, me);
		});

		if ($AppConfig.userObject.hasLink('first_time_logon') && isFeature('suggest-contacts')) {
			wait().then(function() {
				me.showWelcomeMessage();
			});
		}
	},


	setItems: function(upcoming, current, archived) {
		this.removeAll(true);
		this.clearTabs();

		var me = this;
		if (upcoming && upcoming.length) {
			this.addCourses(upcoming, 'Upcoming Courses', null, {category: 'upcoming'});
			this.addTab({label: 'Upcoming', category: 'upcoming', active: true});
		}

		if (current && current.length) {
			this.addCourses(current, 'Current Courses', null, {category: 'current'});
			this.addTab({label: 'Current', category: 'current', active: Ext.isEmpty(upcoming)});
		}

		if (archived && archived.length) {
			this.addBinnedCourses(this.binCourses(archived), 'Archived Courses', {category: 'archived'});
			this.addTab({label: 'Archived', category: 'archived', active: Ext.isEmpty(current) && Ext.isEmpty(upcoming)});
		}

		this.onceRendered
			.then(this.setTops.bind(this));

		this.query('course-catalog-collection').forEach(function(cmp) {
			me.relayEvents(cmp, ['show-course-detail']);
		});
	},


	getTabForCourse: function(course) {
		var id = course.get('NTIID'), targetCmp;

		Ext.each(this.query('course-catalog-collection'), function(cmp) {
			if (cmp.store && cmp.store.find('NTIID', id) >= 0) {
				targetCmp = cmp;
				return false; 
			}
		});

		if (targetCmp) {
			targetCmp.title = Ext.String.capitalize(targetCmp.category);
			return targetCmp;
		}

		return {
			title: 'Courses'
		};
	},


	setPageHeight: function () {
		var h =this.ownerCt &&  this.ownerCt.el && this.ownerCt.el.getHeight(),
			me = this;

		wait(10)
			.then(function () {
				if (h !== undefined && h >= 0) {
					me.el.setStyle('height', (h - 100) + 'px');	
				}
			});
	},


	setTops: function () {
		var upcoming = this.down('[category=upcoming]'),
			current = this.down('[category=current]'),
			archived = this.down('[category=archived]'),
			first = this.down('[category]'),
			defaulTop = 0, t;

		this.scrollTops = {};
		if (first) {
			defaulTop = first.el.getTop();
		}
		
		if (upcoming) {
			this.scrollTops['upcoming'] = upcoming.el.getTop() - defaulTop;
		}
		if (current) {
			this.scrollTops['current'] = current.el.getTop() - defaulTop;	
		}
		if (archived) {
			this.scrollTops['archived'] = archived.el.getTop() - defaulTop;
		}

		this.setPageHeight();
	},


	onScroll: function (e) {
		var target = this.getTargetEl().dom,
			scrollTop = target && target.scrollTop,
			activeTabEl = this.tabsEl.down('.active'),
			key,
			selectTab;

		if (!this.scrollTops) {
			this.scrollTops = {};
		}

		for(key in this.scrollTops) {
			if (this.scrollTops.hasOwnProperty(key)) {
				if (!selectTab) {
					selectTab = key;
				}
				if (this.scrollTops[key] <= scrollTop) {
					selectTab = key;
				}
			}
		}

		if (selectTab) {
			selectTab = this.tabsEl.down('[data-category='+ selectTab +']');

			if (selectTab && activeTabEl !== selectTab) {
				activeTabEl.removeCls('active');
				selectTab.addCls('active');
			}
		}
	},


	onTabClick: function (e) {	
		var target = Ext.get(e.getTarget()),
			isTab = target && target.hasCls('tab'),
			category = target && target.getAttribute('data-category'), 
			activeTab = this.tabsEl.down('.active'), me = this;

		if (!isTab || target.hasCls('active')) {
			return;
		}

		if (this.scrollTops[category] >= 0) {
			this.getTargetEl().scrollTo('top', this.scrollTops[category], true);
		}

		wait()
			.then(function() {
				var selectTab = me.tabsEl.down('[data-category='+ category +']');

				if (selectTab && activeTab !== selectTab) {
					activeTab.removeCls('active');
					selectTab.addCls('active');
				}
			});
	},


	addTab: function(data) {
		this.tabTpl.append(this.tabsEl, data);
	},


	clearTabs: function(){
		if (!this.rendered) { return; }

		this.tabsEl.query('.tab').map(function(a){
			var el = Ext.get(a);
			if (el) {
				el.remove();
			}
		}); 
	},


	// Previous Methods
	showWelcomeMessage: function() {
		var targetEl = this.ownerCt ? this.ownerCt.getTargetEl() : this.getTargetEl(),
			courseStore = Ext.getStore('courseware.EnrolledCourses'),
			enrollmentStatus = courseStore && courseStore.getCount() > 0 ? 'completed' : '';

		if (this.ownerCt && this.ownerCt.updateLabelText) {
			this.ownerCt.updateLabelText(getString('NextThought.view.library.available.CourseWindow.Welcome'));
		}
		this.welcomeCard = Ext.get(this.welcomeCardTpl.append(targetEl, {enrollmentStatus: enrollmentStatus}));
		this.welcomeCard.setVisibilityMode(Ext.Element.DISPLAY);

		// Order of which action we would like the user to take.
		this.requiredActions = ['enroll', 'createProfile', 'suggestContacts'];
		this.updateWindowButtons(this.requiredActions.first());
	},


	showCreateProfile: function(onComplete) {
		var me = this;
		me.createProfileWin = Ext.widget('profile-create-window');
		me.createProfileWin.show();
		me.mon(me.createProfileWin, 'destroy', onComplete);
	},


	onActionComplete: function(actionName) {
		var me = this,
			el = me.welcomeCard && me.welcomeCard.down('.' + actionName), nextAction;

		// Mark action as done
		if (el) {
			el.addCls('completed');
			me.welcomeCard.show();
		}
		Ext.Array.remove(me.requiredActions, actionName);

		// Prepare for next action
		nextAction = me.requiredActions.first();
		if (nextAction) {
			me.updateWindowButtons(nextAction);
		}
		else {
			me.updateWindowButtons('close', getString('NextThought.view.library.available.CourseWindow.Finished'));
		}
	},


	suggestContacts: function(onComplete) {
		var me = this, peersStore;

		$AppConfig.userObject.getSuggestContacts()
			.then(function(items) {
				if (Ext.isEmpty(items)) { return Promise.reject(); }

				var a = Ext.getStore('all-contacts-store');
				peersStore = new Ext.data.Store({
					model: NextThought.model.User,
					proxy: 'memory',
					data: items,
					filters: [
						function(item) {
							return !(a && a.contains(item.get('Username')));
						}
					]
				});
				me.suggestContactsWin = Ext.widget('suggest-contacts-window', {store: peersStore});
				me.suggestContactsWin.show();
				me.mon(me.suggestContactsWin, 'destroy', onComplete);
				me.mon(me.suggestContactsWin, 'destroy', 'refresh');
			})
			.fail(function() {
				onComplete.call(me);
			});
	},


	updateWindowButtons: function(action, name) {
		if (!action) { return; }

		var me = this;
		me.getButtonCfg = function() {
			return {
				name: name || getString('NextThought.view.library.available.CourseWindow.Continue'),
				action: action
			};
		};

		if (me.ownerCt && me.ownerCt.updateButtons) {
			me.ownerCt.updateButtons();
		}
	},


	buttonClick: function(action) {
		if (action === 'enroll') {
			if (this.ownerCt && this.ownerCt.updateLabelText) {
				this.ownerCt.updateLabelText(getString('NextThought.view.library.available.CourseWindow.AddCourses'));
			}
			this.onActionComplete(action);
			this.welcomeCard.hide();
		}
		else if (action === 'createProfile') {
			this.showCreateProfile(this.onActionComplete.bind(this, action));
		}
		else if (action === 'suggestContacts') {
			this.suggestContacts(this.onActionComplete.bind(this, action));
		}
		else {
			console.error('Action: ', action, ' is NOT supported');
		}
	}
});

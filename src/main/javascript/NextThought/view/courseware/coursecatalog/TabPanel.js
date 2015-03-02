Ext.define('NextThought.view.courseware.coursecatalog.TabPanel', {
	extend: 'Ext.tab.Panel',
	alias: 'widget.course-catalog-tabpanel',

	defaultType: 'course-catalog-collection',
	ui: 'available',
	plain: true,
	cls: 'available-courses-tabpanel',
	bodyCls: 'scrollable',
	tabBar: {
		baseCls: 'available-courses-tabbar',
		plain: true,
		margin: 0,
		ui: 'available',
		defaults: {
			ui: 'available',
			border: false
		},
		xhooks: {
			initComponent: function() {
				this.callParent(arguments);
				//this.layout.padding = 0;
				this.layout.overflowHandler =
					new Ext.layout.container.boxOverflow.None(this.layout, {});
				this.layout.overflowHandler.scrollToItem = Ext.emptyFn;
			}
		}
	},


	welcomeCardTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'welcome-card', cn: [
			{cls: 'congrats-container', cn: [
				{cls: 'congrats', cn: [
					{cls: 'sub', html: '{{{NextThought.view.courseware.coursecatalog.TabPanel.Setup}}}'},
					{cls: 'actions', cn: [
						{tag: 'a', cls: 'completed', html: '{{{NextThought.view.courseware.enrollment.Details.CongratsAccountCreated}}}'},
						{tag: 'a', cls: 'enrollment', html: '{{{NextThought.view.courseware.enrollment.Details.CongratsCourseCreated}}}'},
						{tag: 'a', cls: 'create-profile', html: '{{{NextThought.view.courseware.enrollment.Details.CreateProfile}}}'},
						{tag: 'a', cls: 'suggest-contacts', html: '{{{NextThought.view.courseware.enrollment.Details.ConnectWithPeers}}}'}
					]}
				]},
			]}
		]}
	])),


	initComponent: function() {
		this.callParent(arguments);

		var upcoming, current, archived;

		if (this.upcoming) {
			upcoming = this.updateUpcoming(this.upcoming);
		}

		if (this.current) {
			current = this.updateCurrent(this.current);
		}

		if (this.archived) {
			archived = this.updateArchived(this.archived);
		}

		if (!Ext.isEmpty(this.upcoming) && upcoming) {
			this.setActiveTab(upcoming);
		} else if (!Ext.isEmpty(this.current) && current) {
			this.setActiveTab(current);
		} else if (!Ext.isEmpty(this.archived) && archived) {
			this.setActiveTab(archived);
		} else {
			console.error('No Courses to set the active tab to');
			this.setActiveTab(upcoming || current || archived);
		}
	},


	buildStore: function(data) {
		return new Ext.data.Store({
			model: 'NextThought.model.courses.CourseCatalogEntry',
			data: data
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		var me = this;

		if ($AppConfig.userObject.hasLink('first_time_logon') && isFeature('suggest-contacts')) {
			wait().then(function() {
				me.showWelcomeMessage();
			});
		}
	},


	getTabForCourse: function(course) {
		var id = course.get('NTIID'),
			upcoming = this.down('[title=Upcoming]'),
			current = this.down('[title=Current]'),
			archived = this.down('[title=Archived]');

		if (upcoming && upcoming.store && upcoming.store.find('NTIID', id) >= 0) { return upcoming; }

		if (current && current.store && current.store.find('NTIID', id) >= 0) { return current; }

		if (archived && archived.store && archived.store.find('NTIID', id) > 0) { return archived; }

		return {
			title: 'Courses'
		};
	},


	updateCurrent: function(courses) {
		var cmp = this.down('[title=Current]');

		if (Ext.isEmpty(courses)) {
			if (cmp) { cmp.destroy(); }

			cmp = this.add({
				xtype: 'box',
				autoEl: {tag: 'div', cls: 'empty-text', html: 'There are no current courses.'},
				title: 'Current'
			});
			this.relayEvents(cmp, ['show-course-detail']);
			return cmp;
		}

		if (cmp) {
			if (!cmp.store) {
				cmp.bindStore(this.buildStore(courses));
			} else {
				cmp.store.loadRecords(courses);
			}
		} else {
			cmp = this.add({
				xtype: 'course-catalog-collection',
				store: this.buildStore(courses),
				title: 'Current'
			});
			this.relayEvents(cmp, ['show-course-detail']);
		}

		return cmp;
	},


	updateUpcoming: function(courses) {
		var cmp = this.down('[title=Upcoming]');

		if (Ext.isEmpty(courses)) {
			if (cmp) { cmp.destroy(); }

			cmp = this.add({
				xtype: 'box',
				autoEl: {tag: 'div', cls: 'empty-text', html: 'There are no upcoming courses.'},
				title: 'Upcoming'
			});
			this.relayEvents(cmp, ['show-course-detail']);
			return cmp;
		}

		if (cmp) {
			if (!cmp.store) {
				cmp.bindStore(this.buildStore(courses));
			} else {
				cmp.store.loadRecords(courses);
			}
		} else {
			cmp = this.add({
				xtype: 'course-catalog-collection',
				store: this.buildStore(courses),
				title: 'Upcoming'
			});
			this.relayEvents(cmp, ['show-course-detail']);
		}

		return cmp;
	},


	updateArchived: function(courses) {
		var cmp = this.down('[title=Archived]');

		if (Ext.isEmpty(courses)) {
			if (cmp) { cmp.destroy(); }

			cmp = this.add({
				xtype: 'box',
				autoEl: {tag: 'div', cls: 'empty-text', html: 'There are no archived courses.'},
				title: 'Archived'
			});
			this.relayEvents(cmp, ['show-course-detail']);
			return cmp;
		}

		if (cmp) {
			if (!cmp.store) {
				cmp.bindStore(this.buildStore(courses));
			} else {
				cmp.store.loadRecords(courses);
			}
		} else {
			cmp = this.add({
				xtype: 'course-catalog-collection',
				store: this.buildStore(courses),
				title: 'Archived'
			});
			this.relayEvents(cmp, ['show-course-detail']);
		}

		return cmp;
	},


	showWelcomeMessage: function() {
		var targetEl = this.ownerCt ? this.ownerCt.getTargetEl() : this.getTargetEl();
		this.welcomeCard = Ext.get(this.welcomeCardTpl.append(targetEl));
		this.updateWindowButtons('enroll');
		if (this.ownerCt && this.ownerCt.updateLabelText) {
			this.ownerCt.updateLabelText(getString('NextThought.view.library.available.CourseWindow.Welcome'));
		}
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
			this.updateWindowButtons('close', getString('NextThought.view.library.available.CourseWindow.Finished'));
			this.welcomeCard.remove();
			delete this.welcomeCard;
		}
		else {
			console.error('Action: ', action, ' is NOT supported');
		}
	}
});

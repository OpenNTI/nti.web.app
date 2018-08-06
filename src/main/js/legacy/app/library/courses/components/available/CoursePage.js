const Ext = require('@nti/extjs');
const {wait} = require('@nti/lib-commons');

const LibraryActions = require('legacy/app/library/Actions');
const CoursesActions = require('legacy/app/library/courses/Actions');
const User = require('legacy/model/User');
const {isFeature} = require('legacy/util/Globals');
const {getString, getFormattedString} = require('legacy/util/Localization');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));

require('../Page');
require('legacy/app/redeem/Redeem');

module.exports = exports = Ext.define('NextThought.app.library.courses.components.available.CoursePage', {
	extend: 'NextThought.app.library.courses.components.Page',
	alias: ['widget.library-availalble-courses-page'],

	cls: 'page scrollable',

	defaultType: 'course-catalog-collection',

	getTargetEl: function () {
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

	tabbedComponents: {},


	renderSelectors: {
		tabsEl: '.tabs',
		bodyContainerEl: '.body-container'
	},


	getCourseStore: function (data) {
		return new Ext.data.Store({
			model: 'NextThought.model.courses.CourseCatalogEntry',
			data: data,
			sorters: [{property: 'ProviderUniqueID', direction: 'ASC'}]
		});
	},


	afterRender: function () {
		this.callParent(arguments);
		var me = this;

		this.setPageHeight();
		this.bufferedScroll = Ext.Function.createBuffered(this.onScroll, 50);
		this.mon(this.getTargetEl(), 'scroll', this.bufferedScroll.bind(this));
		this.mon(this.tabsEl, 'click', this.onTabClick.bind(this));
		Ext.EventManager.onWindowResize(this.setPageHeight, this);
		me.on('destroy', function () {
			Ext.EventManager.removeResizeListener(me.setPageHeight, me);
		});

		if ($AppConfig.userObject.hasLink('first_time_logon') && isFeature('suggest-contacts')) {
			wait().then(function () {
				me.showWelcomeMessage();
			});
		}

		this.LibraryActions = LibraryActions.create();
		this.CourseActions = CoursesActions.create();
	},


	setItems: function (upcoming, current, archived, archivedLoader, activeTab) {
		this.removeAll(true);
		this.clearTabs();
		this.archivedLoader = archivedLoader;

		var me = this;
		if (upcoming && upcoming.length) {
			const activeState = !this.code && (!activeTab || activeTab === 'Upcoming');
			this.tabbedComponents['upcoming'] = this.addCourses(upcoming, getString('library.courses.components.available.CoursePage.upcoming'), null, {category: 'upcoming', xtype: 'course-catalog-collection'});
			this.addTab({label: 'Upcoming', category: 'upcoming', active: activeState});
			if(!activeState) {
				this.tabbedComponents['upcoming'].hide();
			}
		}

		if (current && current.length) {
			const activeState = (Ext.isEmpty(upcoming) && !activeTab) || activeTab === 'Current';
			this.tabbedComponents['current'] = this.addCourses(current, getString('library.courses.components.available.CoursePage.current'), null, {category: 'current', xtype: 'course-catalog-collection'});
			this.addTab({label: 'Current', category: 'current', active: activeState});
			if(!activeState) {
				this.tabbedComponents['current'].hide();
			}
		}

		if (archived && archived.length) {
			var container = {
				xtype: 'container',
				layout: 'none',
				items: []
			};

			var containerCmp = this.add(container);

			const activeState = (Ext.isEmpty(current) && Ext.isEmpty(upcoming) && !activeTab) || activeTab === 'Archived';
			this.tabbedComponents['archived'] = this.addBinnedCourses(containerCmp, this.binCourses(archived), getString('library.courses.components.available.CoursePage.archived'), {category: 'archived', xtype: 'course-catalog-collection'});
			this.addTab({label: 'Archived', category: 'archived', active: activeState});
			if(!activeState) {
				this.tabbedComponents['archived'].hide();
			}
		}
		else if(archivedLoader) {
			this.addTab({label: 'Archived', category: 'archived', active: Ext.isEmpty(current) && Ext.isEmpty(upcoming)});
		}

		if (this.rendered) {
			const activeState = activeTab === 'Redeem' || (Ext.isEmpty(current) && Ext.isEmpty(upcoming) && Ext.isEmpty(archived) || !!this.code);
			this.redeemWidget = this.add({xtype: 'library-redemption', redeemLink: 'link', code: this.code, onSuccess: this.onRedeemSuccess.bind(this) });
			this.tabbedComponents['redeem'] = this.redeemWidget;
			if(!activeState) {
				this.tabbedComponents['redeem'].hide();
			}
			this.addTab({label: 'Redeem', category: 'redeem', active: activeState});
		}

		this.query('course-catalog-collection').forEach(function (cmp) {
			me.relayEvents(cmp, ['show-course-detail']);
		});

		// recalculate page height after setting items
		this.setPageHeight();
	},


	onRedeemSuccess (results) {
		let newCourse = lazy.ParseUtils.parseItems(results)[0];

		this.LibraryActions.reload()
			.then( () => {
				return this.CourseActions.findCourseInstance(newCourse.get('NTIID'));
			})
			.then( course => {
				var courseTitle = course.getTitle();
				if(!courseTitle || courseTitle === '') {
					courseTitle = course.getCourseCatalogEntry() && course.getCourseCatalogEntry().get('title');
				}

				this.fireEvent('show-course-detail', course.getCourseCatalogEntry());
				this.showMessage(getFormattedString('NextThought.view.library.available.CourseWindow.InvitationAcceptance', {courseTitle}), false);
			});
	},


	getTabForCourse: function (course) {
		var id = course.get('NTIID'), targetCmp;

		Ext.each(this.query('course-catalog-collection'), function (cmp) {
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
			title: getString('NextThought.view.library.View.course')
		};
	},


	setPageHeight: function () {
		var h = this.ownerCt &&	 this.ownerCt.el && this.ownerCt.el.getHeight(),
			me = this;

		wait(10)
			.then(function () {
				if (h !== undefined && h >= 0) {
					me.el.setStyle('height', (h - 100) + 'px');
				}
			});
	},


	onTabClick: function (e) {
		var target = Ext.get(e.getTarget()),
			isTab = target && target.hasCls('tab'),
			category = target && target.getAttribute('data-category'),
			activeTab = this.tabsEl.down('.active'), me = this;

		if (!isTab || target.hasCls('active')) {
			return;
		}

		wait()
			.then(function () {
				var selectTab = me.tabsEl.down('[data-category=' + category + ']');

				for(var prop in me.tabbedComponents) {
					if(prop === category) {
						me.tabbedComponents[prop].show();
					}
					else {
						me.tabbedComponents[prop].hide();
					}
				}

				if (selectTab && activeTab !== selectTab) {
					activeTab.removeCls('active');
					selectTab.addCls('active');
				}

				if(category === 'archived' && !me.archivedLoaded && !me.archivedLoading) {
					me.archivedLoading = true;
					me.el.mask('Loading Archived...');
					me.archivedLoader().then((items) => {
						var container = {
							xtype: 'container',
							layout: 'none',
							items: []
						};

						var containerCmp = me.add(container);

						// save items for later use
						me.loadedArchivedItems = items;

						me.tabbedComponents['archived'] = me.addBinnedCourses(containerCmp, me.binCourses(items), getString('library.courses.components.available.CoursePage.archived'), {category: 'archived', xtype: 'course-catalog-collection'});
						me.archivedLoaded = true;
						me.archivedLoading = false;
						me.el.unmask();
						me.query('course-catalog-collection').forEach(function (cmp) {
							me.relayEvents(cmp, ['show-course-detail']);
						});
					});
				}
			});
	},


	addTab: function (data) {
		this.tabTpl.append(this.tabsEl, data);
	},


	clearTabs: function () {
		if (!this.rendered) { return; }

		this.tabsEl.query('.tab').map(function (a) {
			var el = Ext.get(a);
			if (el) {
				el.remove();
			}
		});
	},


	// Previous Methods
	showWelcomeMessage: function () {
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


	showCreateProfile: function (onComplete) {
		var me = this;
		me.createProfileWin = Ext.widget('profile-create-window');
		me.createProfileWin.show();
		me.mon(me.createProfileWin, 'destroy', onComplete);
	},


	onActionComplete: function (actionName) {
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


	suggestContacts: function (onComplete) {
		var me = this, peersStore;

		$AppConfig.userObject.getSuggestContacts()
			.then(function (items) {
				if (Ext.isEmpty(items)) { return Promise.reject(); }

				var a = Ext.getStore('all-contacts-store');
				peersStore = new Ext.data.Store({
					model: User,
					proxy: 'memory',
					data: items,
					filters: [
						function (item) {
							return !(a && a.contains(item.get('Username')));
						}
					]
				});
				me.suggestContactsWin = Ext.widget('suggest-contacts-window', {store: peersStore});
				me.suggestContactsWin.show();
				me.mon(me.suggestContactsWin, 'destroy', onComplete);
				me.mon(me.suggestContactsWin, 'destroy', 'refresh');
			})
			.catch(function () {
				onComplete.call(me);
			});
	},


	updateWindowButtons: function (action, name) {
		if (!action) { return; }

		var me = this;
		me.getButtonCfg = function () {
			return {
				name: name || getString('NextThought.view.library.available.CourseWindow.Continue'),
				action: action
			};
		};

		if (me.ownerCt && me.ownerCt.updateButtons) {
			me.ownerCt.updateButtons();
		}
	},


	buttonClick: function (action) {
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

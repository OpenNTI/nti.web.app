const Ext = require('extjs');
const {wait} = require('nti-commons');

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


	setItems: function (upcoming, current, archived) {
		this.removeAll(true);
		this.clearTabs();

		var me = this;
		if (upcoming && upcoming.length) {
			this.addCourses(upcoming, 'Upcoming Courses', null, {category: 'upcoming'});
			this.addTab({label: 'Upcoming', category: 'upcoming', active: true && !this.code});
		}

		if (current && current.length) {
			this.addCourses(current, 'Current Courses', null, {category: 'current'});
			this.addTab({label: 'Current', category: 'current', active: Ext.isEmpty(upcoming)});
		}

		if (archived && archived.length) {
			this.addBinnedCourses(this.binCourses(archived), 'Archived Courses', {category: 'archived'});
			this.addTab({label: 'Archived', category: 'archived', active: Ext.isEmpty(current) && Ext.isEmpty(upcoming)});
		}

		if (this.rendered) {
			this.add({xtype: 'library-redemption', redeemLink: 'link', code: this.code, onSuccess: this.onRedeemSuccess.bind(this) });
			this.addTab({label: 'Redeem', category: 'redeem', active: (Ext.isEmpty(current) && Ext.isEmpty(upcoming) && Ext.isEmpty(archived) || !!this.code)});
		}

		this.onceRendered
			.then(this.setTops.bind(this));

		this.query('course-catalog-collection').forEach(function (cmp) {
			me.relayEvents(cmp, ['show-course-detail']);
		});
	},


	onRedeemSuccess (results) {
		let newCourse = lazy.ParseUtils.parseItems(results)[0];

		this.LibraryActions.reload()
			.then( () => {
				return this.CourseActions.findCourseInstance(newCourse.get('NTIID'));
			})
			.then( course => {
				this.fireEvent('show-course-detail', course.getCourseCatalogEntry());
				this.showMessage(getFormattedString('NextThought.view.library.available.CourseWindow.InvitationAcceptance', {courseTitle: course.getTitle()}), false);
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
			title: 'Courses'
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


	setTops () {
		const redeem = this.down('library-redemption');
		const upcomingTab = this.down('[category=upcoming]');
		const currentTab = this.down('[category=current]');
		const archivedTab = this.down('[category=archived]');

		Promise.all([
			upcomingTab && upcomingTab.onceRendered,
			currentTab && currentTab.onceRendered,
			archivedTab && archivedTab.onceRendered,
			redeem && redeem.onceRendered
		])
			.then(() => {
			//Since the components are Ext.views, wait an event pump for the items
			//to get rendered
				return wait();
			})
			.then(() => {
				const get = (category) => Array.from(this.el.dom.querySelectorAll(`.available-catalog[data-category="${category}"]`));
				let upcoming = get('upcoming');
				let current = get('current');
				let archived = get('archived');

				const copy = (x, ...props) => props.reduce((o, prop) => (o[prop] = x[prop], o), {});

				const wrap = list => ({
					getBoundingClientRect () {
						const els = [
							list[0], //first element in list
							list[list.length - 1] //last element in list
						]
						//filter out undefined
							.filter(x => x)
							//swap elements with their bounding rects.
							.map(x => copy(x.getBoundingClientRect(), 'top', 'bottom'));

						return els.length === 0
							? null
							: els.reduce((acc, rect) => (acc.bottom = rect.bottom, acc)); //merge rects into one.
					}
				});

				this.scrollTops = {};

				if (upcomingTab) {
					this.scrollTops['upcoming'] = wrap(upcoming);
				}
				if (currentTab) {
					this.scrollTops['current'] = wrap(current);
				}
				if (archivedTab) {
					this.scrollTops['archived'] = wrap(archived);
				}
				if(redeem) {
					this.scrollTops['redeem'] = redeem.el.dom;
				}

				this.setPageHeight();
			});
	},


	onScroll: function (/*e*/) {
		var target = this.getTargetEl().dom,
			targetTop = target.getBoundingClientRect().top,
			activeTabEl = this.tabsEl.down('.active'),
			select = false,
			last,
			selectTab;

		if (!this.scrollTops) {
			this.scrollTops = {};
		}

		for (let element of Object.keys(this.scrollTops)) {
			let clientRect = this.scrollTops[element].getBoundingClientRect(),
				bottom = clientRect && clientRect.bottom;

			if(!selectTab || select) {
				selectTab = element;
				select = false;
			}

			if(bottom <= targetTop) {
				select = true;
			}

			last = element;
		}

		if(target.clientHeight + target.scrollTop === target.scrollHeight) {
			selectTab = last;
		}

		if (selectTab) {
			selectTab = this.tabsEl.down('[data-category=' + selectTab + ']');

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
			activeTab = this.tabsEl.down('.active'), me = this,
			container = this.getTargetEl(),
			containerTop = container && container.dom.getBoundingClientRect().top;

		if (!isTab || target.hasCls('active')) {
			return;
		}

		if (this.scrollTops[category]) {
			let tabTop = this.scrollTops[category].getBoundingClientRect().top,
				scrollValue = (tabTop - containerTop) + container.dom.scrollTop;

			this.getTargetEl().scrollTo('top', scrollValue, true);
		}

		wait()
			.then(function () {
				var selectTab = me.tabsEl.down('[data-category=' + category + ']');

				if (selectTab && activeTab !== selectTab) {
					activeTab.removeCls('active');
					selectTab.addCls('active');
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

const Ext = require('@nti/extjs');
const {scoped} = require('@nti/lib-locale');

const CoursesStateStore = require('legacy/app/library/courses/StateStore');
const {getString} = require('legacy/util/Localization');

const DEFAULT_TEXT = {
	instructor: {
		one: 'Instructor',
		other: 'Instructors'
	},
	invitation: 'Invitation Code'
};

const t = scoped('course.info.components.menu', DEFAULT_TEXT);


module.exports = exports = Ext.define('NextThought.app.course.info.components.Menu', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-outline-menu',

	//<editor-fold desc="Config">

	ui: 'course-info',
	cls: 'nav-outline static',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			'{{{NextThought.view.courseware.info.outline.Menu.header}}}'
		]},
		{ cls: 'outline-menu'},
		{ cls: 'static-invitation-code'}
	]),

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'outline-row{[values.active ? " x-item-selected" : ""]}', 'data-trigger': '{trigger}', 'data-qtip': '{title:htmlEncode}', 'data-route': '{route}', cn: [
			{cls: 'label', html: '{title:htmlEncode}'}
		]
	})),


	inviteTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'invitation-wrapper', cn: [
			{cls: 'invite-header', html: t('invitation')},
			{cls: 'label code', html: '{code}'}
		]
	})),

	renderSelectors: {
		menuEl: '.outline-menu',
		inviteEl: '.static-invitation-code'
	},

	getTargetEl: function () {
		return this.menuEl;
	},

	initComponent () {
		this.CourseStore = CoursesStateStore.getInstance();
	},

	afterRender: function () {
		this.callParent(arguments);

		this.addMenuItems();

		if (this.inviteCodeLink) {
			this.addStaticInviteCode();
		}

		this.mon(this.menuEl, 'click', this.onClick.bind(this));
		this.CourseStore.on('modified-course', this.addStaticInviteCode.bind(this));
	},

	adjustScroll: function (el) {
		if(!el) {
			return;
		}

		var qtip = el.getAttribute('data-qtip');

		if(this.QTIP_TO_CLASS_MAP[qtip]) {
			var { cls, targetCls, doLocalNav } = this.QTIP_TO_CLASS_MAP[qtip];

			var target = document.getElementsByClassName(targetCls);
			var containerPanel = document.getElementsByClassName(cls);

			if(containerPanel && containerPanel[0]) {
				if(doLocalNav && target && target[0]) {
					window.scrollTo(0, target[0].offsetTop);
				}
			}
		}
	},

	addMenuItems: function () {
		var me = this,
			i = ( this.info && this.info.get('Instructors')) || [] ;
		if (!this.rendered) {
			this.onceRendered.then(me.addMenuItems.bind(me));
			return;
		}

		me.itemTpl.append(me.menuEl, {
			title: 'About',
			active: true,
			trigger: 'about'
		});

		me.itemTpl.append(me.menuEl, {
			title: i.length > 1 ? t('instructor.other') : t('instructor.one'),
			trigger: 'instructors'
		});

		me.itemTpl.append(me.menuEl, {
			title: getString('NextThought.view.courseware.info.outline.Menu.support'),
			trigger: 'support'
		});

		if (this.showRoster || this.showReports || this.showAdvanced) {
			me.itemTpl.append(me.menuEl, {
				title: 'Admin Tools',
				trigger: 'admin'
			});
		}
	},

	addStaticInviteCode () {
		if (!this.rendered) {
			if(!this.onceRendered.addStaticInviteCode) {
				this.onceRendered.addStaticInviteCode = true;
				this.onceRendered.then(this.addStaticInviteCode.bind(this));
			}
			return;
		}

		delete this.onceRendered.addStaticInviteCode;

		if (!this.inviteCodeLink) {
			return;
		}

		Service.request(this.inviteCodeLink)
			.then( code => {
				let courseInvitations = JSON.parse(code),
					codes = courseInvitations.Items && courseInvitations.Items.map( invite => invite.Code).join(',');

				if (this.inviteEl) {
					this.inviteEl.dom.innerHTML = '';
					this.inviteTpl.append(this.inviteEl, {
						code: codes
					});
					this.inviteEl.selectable();
				}
			});
	},

	setActiveItem: function (route) {
		var activeItem = this.el && this.el.down('.x-item-selected'),
			activeItemRoute = activeItem && activeItem.getAttribute('data-route');

		if (activeItemRoute === route || !this.rendered) { return; }

		activeItem.removeCls('x-item-selected');
		activeItem = this.el.down('[data-qtip=About]');

		if (activeItem) {
			activeItem.addCls('x-item-selected');
		}

		this.adjustScroll(activeItem);
	},


	updateClasses: function (trigger) {
		var activeItem = this.el && this.el.down('.x-item-selected');

		activeItem && activeItem.removeCls('x-item-selected');
		activeItem = this.el.down(`[data-trigger=${trigger}]`);
		activeItem.addCls('x-item-selected');
	},

	QTIP_TO_CLASS_MAP: {
		'about': {
			cls: 'course-info-panel',
			targetCls: 'course-info-panel',
			doLocalNav: true
		},
		'instructors': {
			cls: 'course-info-panel',
			targetCls: 'facilitators-section',
			doLocalNav: true
		},
		'support': {
			cls: 'course-info-panel',
			targetCls: 'course-info-support',
			doLocalNav: true
		},
		'admin': {
			cls: 'course-info-panel',
			targetCls: 'course-admin-panel',
			doLocalNav: true
		}
	},

	showSection: function (cls) {
		var section = document.getElementsByClassName(cls);

		if(section && section[0]) {
			section[0].style.display = '';
		}
	},

	hideOtherSections: function (cls) {
		Object.keys(this.QTIP_TO_CLASS_MAP).forEach(k => {
			var curr = this.QTIP_TO_CLASS_MAP[k];

			if(curr.cls !== cls) {
				var section = document.getElementsByClassName(curr.cls);

				if(section && section[0]) {
					section[0].style.display = 'none';
				}
			}
		});
	},

	onClick: function (e) {
		var item = e.getTarget('.outline-row');

		if (!item) { return; }

		var trigger = item.getAttribute('data-trigger');

		var infoPanel = document.getElementsByClassName('course-info-panel');

		infoPanel = (infoPanel && infoPanel[0]) || {};

		if(this.QTIP_TO_CLASS_MAP[trigger]) {
			var { cls, targetCls, doLocalNav } = this.QTIP_TO_CLASS_MAP[trigger];

			var target = document.getElementsByClassName(targetCls);
			var containerPanel = document.getElementsByClassName(cls);

			if(containerPanel && containerPanel[0]) {
				this.showSection(cls);
				this.hideOtherSections(cls);

				if(doLocalNav && target && target[0]) {
					window.scrollTo(0, target[0].offsetTop);
				}

				this.updateClasses(trigger);
			}
		}
		else {
			if(infoPanel) {
				infoPanel.style.display = 'none';
			}
		}
	}
});

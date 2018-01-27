const Ext = require('extjs');

const {isFeature} = require('legacy/util/Globals');
const {getString, getFormattedString} = require('legacy/util/Localization');


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
		cls: 'outline-row{[values.active ? " x-item-selected" : ""]}', 'data-qtip': '{title:htmlEncode}', 'data-route': '{route}', cn: [
			{cls: 'label', html: '{title:htmlEncode}'}
		]
	})),


	inviteTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'invitation-wrapper', cn: [
			{cls: 'invite-header', html: 'Course Invitation Code'},
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

	afterRender: function () {
		this.callParent(arguments);

		this.addMenuItems();

		if (this.inviteCodeLink) {
			this.addStaticInviteCode();
		}

		this.mon(this.menuEl, 'click', this.onClick.bind(this));
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
			route: '/',
			active: true
		});

		me.itemTpl.append(me.menuEl, {
			title: getFormattedString('NextThought.view.courseware.info.outline.Menu.courseinstructors', {
				instructor: Ext.util.Format.plural(i.length, 'Instructor', true)}),
			route: '/instructors'
		});

		me.itemTpl.append(me.menuEl, {
			title: getString('NextThought.view.courseware.info.outline.Menu.support'),
			route: '/support'
		});

		if (isFeature('course-administration') && (this.showRoster || this.showReports)) {
			me.itemTpl.append(me.menuEl, {
				title: 'Admin Tools',
				route: '/admintools'
			});
		}
	},

	addStaticInviteCode () {
		const me = this;
		if (!me.rendered) {
			me.onceRendered.then(me.addStaticInviteCode.bind(me));
			return;
		}

		Service.request(me.inviteCodeLink)
			.then( code => {
				let courseInvitations = JSON.parse(code),
					codes = courseInvitations.Items && courseInvitations.Items.map( invite => invite.Code).join(',');

				if (me.inviteEl) {
					me.inviteTpl.append(me.inviteEl, {
						code: codes
					});
					me.inviteEl.selectable();
				}
			});
	},

	setActiveItem: function (route) {
		var activeItem = this.el && this.el.down('.x-item-selected'),
			activeItemRoute = activeItem && activeItem.getAttribute('data-route');

		if (activeItemRoute === route || !this.rendered) { return; }

		activeItem.removeCls('x-item-selected');
		activeItem = this.el.down('[data-route=' + route + ']');

		if (activeItem) {
			activeItem.addCls('x-item-selected');
		}

		this.adjustScroll(activeItem);
	},


	updateClasses: function (qtip) {
		var activeItem = this.el && this.el.down('.x-item-selected');

		activeItem && activeItem.removeCls('x-item-selected');
		activeItem = this.el.down('[data-qtip=' + qtip + ']');
		activeItem.addCls('x-item-selected');
	},

	QTIP_TO_CLASS_MAP: {
		'About': {
			cls: 'course-info-panel',
			targetCls: 'course-info-editor-section',
			doLocalNav: true
		},
		'Course Instructors': {
			cls: 'course-info-panel',
			targetCls: 'facilitators-section',
			doLocalNav: true
		},
		'Course Instructor': {
			cls: 'course-info-panel',
			targetCls: 'facilitators-section',
			doLocalNav: true
		},
		'Tech Support': {
			cls: 'course-info-panel',
			targetCls: 'course-info-support',
			doLocalNav: true
		},
		'Admin Tools': {
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

		var qtip = item.getAttribute('data-qtip');

		var infoPanel = document.getElementsByClassName('course-info-panel');

		infoPanel = (infoPanel && infoPanel[0]) || {};

		if(this.QTIP_TO_CLASS_MAP[qtip]) {
			var { cls, targetCls, doLocalNav } = this.QTIP_TO_CLASS_MAP[qtip];

			var target = document.getElementsByClassName(targetCls);
			var containerPanel = document.getElementsByClassName(cls);

			if(containerPanel && containerPanel[0]) {
				this.showSection(cls);
				this.hideOtherSections(cls);

				if(doLocalNav && target && target[0]) {
					window.scrollTo(0, target[0].offsetTop);
				}

				this.updateClasses(qtip);
			}
		}
		else {
			if(infoPanel) {
				infoPanel.style.display = 'none';
			}

		}

		this.fireEvent('select-route', item.getAttribute('data-qtip'), item.getAttribute('data-route'));
	}
});

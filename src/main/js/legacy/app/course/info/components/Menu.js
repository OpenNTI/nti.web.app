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

		if (this.showRoster) {
			me.itemTpl.append(me.menuEl, {
				title: getString('NextThought.view.courseware.info.outline.Menu.roster'),
				route: '/roster'
			});

			if (isFeature('analytic-reports')) {
				me.itemTpl.append(me.menuEl, {
					title: 'Report',
					route: '/report'
				});
			}
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
	},


	updateClasses: function (qtip) {
		var activeItem = this.el && this.el.down('.x-item-selected');

		activeItem && activeItem.removeCls('x-item-selected');
		activeItem = this.el.down('[data-qtip=' + qtip + ']');
		activeItem.addCls('x-item-selected');
	},


	onClick: function (e) {
		var item = e.getTarget('.outline-row');

		if (!item) { return; }

		var qtip = item.getAttribute('data-qtip');

		var target;

		var infoPanel = document.getElementsByClassName('course-info-panel');

		infoPanel = (infoPanel && infoPanel[0]) || {};

		if(qtip === 'About') {
			target = document.getElementsByClassName('course-info-editor-section');

			if(target && target[0] && infoPanel.style.display !== 'none') {
				window.scrollTo(0, target[0].offsetTop);
				this.updateClasses(qtip);
			}
			else {
				this.fireEvent('select-route', item.getAttribute('data-qtip'), item.getAttribute('data-route'));
			}
		}
		else if(qtip === 'Course Instructor') {
			target = document.getElementsByClassName('facilitators-section');

			if(target && target[0] && infoPanel.style.display !== 'none') {
				window.scrollTo(0, target[0].offsetTop);
				this.updateClasses(qtip);
			}
			else {
				this.fireEvent('select-route', item.getAttribute('data-qtip'), item.getAttribute('data-route'));
			}
		}
		else if(qtip === 'Tech Support') {
			target = document.getElementsByClassName('course-info-support');

			if(target && target[0] && infoPanel.style.display !== 'none') {
				window.scrollTo(0, target[0].offsetTop);
				this.updateClasses(qtip);
			}
			else {
				this.fireEvent('select-route', item.getAttribute('data-qtip'), item.getAttribute('data-route'));
			}
		}
		else {
			this.fireEvent('select-route', item.getAttribute('data-qtip'), item.getAttribute('data-route'));
		}
	}
});

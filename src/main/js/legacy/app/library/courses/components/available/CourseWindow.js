/*eslint no-undef:1*/

const { getService, isFlag } = require('@nti/web-client');
const Ext = require('@nti/extjs');
const { encodeForURI, decodeFromURI } = require('@nti/lib-ntiids');
const { wait } = require('@nti/lib-commons');
const EnrollmentActions = require('internal/legacy/app/course/enrollment/Actions');
const EnrollmentStateStore = require('internal/legacy/app/course/enrollment/StateStore');
const StoreActions = require('internal/legacy/app/store/Actions');
const { getString } = require('internal/legacy/util/Localization');

const CoursesActions = require('../../Actions');
const CoursesStateStore = require('../../StateStore');

require('internal/legacy/util/Parsing');
require('internal/legacy/common/window/Window');
require('internal/legacy/mixins/Router');
require('internal/legacy/app/course/catalog/Collection');
require('internal/legacy/app/course/enrollment/Details');
require('internal/legacy/app/course/enrollment/components/Process');
require('./CoursePage');
require('./Actions');

module.exports = exports = Ext.define(
	'NextThought.app.library.courses.components.available.CourseWindow',
	{
		extend: 'NextThought.common.window.Window',
		alias: 'widget.library-available-courses-window',

		mixins: {
			Router: 'NextThought.mixins.Router',
		},

		floating: true,
		label: getString(
			'NextThought.view.library.available.CourseWindow.AddCourses'
		),
		constrainTo: Ext.getBody(),
		width: 1024,
		height: '85%',
		dialog: true,
		header: false,
		componentLayout: 'natural',
		layout: 'card',
		cls: 'available-courses',

		getTargetEl: function () {
			return this.body;
		},

		childEls: ['body'],
		getDockedItems: function () {
			return [];
		},

		/*
		 * Ext is shooting us in the foot when it tries to center it
		 * so for now just don't let Ext do anything here.
		 */
		setPosition: function () {},

		/*
		 * This is always going to be positioned  fixed, so don't
		 * let Ext layout try to calculate according to parents.
		 */
		center: function () {
			if (!this.rendered) {
				this.on('afterrender', this.center.bind(this));
				return;
			}

			var dom = this.el && this.el.dom,
				myWidth = this.getWidth(),
				myHeight = this.getHeight(),
				viewWidth = Ext.Element.getViewportWidth(),
				viewHeight = Ext.Element.getViewportHeight(),
				top,
				left;

			top = (viewHeight - myHeight) / 2;
			left = (viewWidth - myWidth) / 2;

			top = Math.max(top, 0);
			left = Math.max(left, 0);

			dom.style.top = top + 'px';
			dom.style.left = left + 'px';
		},

		buttonCfg: [
			{
				name: getString(
					'NextThought.view.library.available.CourseWindow.Finished'
				),
				action: 'close',
			},
		],

		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'header',
				cn: [
					{ cls: 'identifier', html: '{identifier}' },
					{ cls: 'name', html: '{label}' },
					{ cls: 'close' },
				],
			},
			{
				cls: 'msg-container',
				cn: [{ cls: 'msg' }, { cls: 'close-msg' }],
			},
			{
				id: '{id}-body',
				cls: 'body-container',
				cn: ['{%this.renderContainer(out,values)%}'],
			},
			{ cls: 'footer' },
		]),

		btnTpl: new Ext.XTemplate(
			Ext.DomHelper.markup({
				cls: 'button {disabled} {secondary}',
				'data-action': '{action}',
				html: '{name}',
			})
		),

		renderSelectors: {
			labelEl: '.header .name',
			identifierEl: '.header .identifier',
			msgContainerEl: '.msg-container',
			msgEl: '.msg-container .msg',
			bodyEl: '.body-container',
			footerEl: '.footer',
		},

		restore: function (state) {
			var me = this;

			function finish(catalogEntry, fulfill) {
				delete state.paymentcomplete;

				if (catalogEntry) {
					me.showEnrollmentOption(
						catalogEntry,
						'FiveminuteEnrollment'
					);
				}

				fulfill();
			}

			return new Promise(function (fulfill) {
				if (state.paymentcomplete) {
					Promise.resolve(
						me.CourseStore.getMostRecentEnrollmentCourse()
					)
						.then(function (course) {
							if (!course) {
								console.error('No Course to restore state to');
							} else {
								finish(course.getCourseCatalogEntry(), fulfill);
							}
						})
						.catch(function (reason) {
							if (!state.cce) {
								return Promise.reject(
									'No most recent enrollment, or cce to return to'
								);
							} else {
								return me.CourseStore.findForNTIID(state.cce);
							}
						})
						.then(function (entry) {
							if (!entry) {
								return Promise.reject(
									'No cce for ' + state.cce
								);
							} else {
								finish(entry, fulfill);
							}
						})
						.fail(function (reason) {
							console.error(
								'unable to return from payment: ',
								reason
							);
							finish(false, fulfill);
						});
				} else if (state.enrollmentOption) {
					if (!me.courseDetail) {
						console.error(
							'Trying to restore an enrollment option without an active course set:',
							state
						);
						fulfill();
					} else {
						me.courseDetail.restoreEnrollmentOption(
							state.enrollmentOption,
							state.enrollmentConfig
						);
						fulfill();
					}
				} else {
					fulfill();
				}
			});
		},

		initComponent: function () {
			this.callParent(arguments);

			this.CourseActions = CoursesActions.create();
			this.CourseStore = CoursesStateStore.getInstance();
			this.CourseEnrollmentStore = EnrollmentStateStore.getInstance();
			this.CourseEnrollmentActions = EnrollmentActions.create();
			this.StoreActions = StoreActions.create();

			this.initRouter();

			this.addRoute('/', this.showCourses.bind(this));
			this.addRoute('/:id', this.showCourseDetail.bind(this));
			this.addRoute('/:id/forcredit', this.showForCredit.bind(this));
			this.addRoute('/:id/purchase', this.showPurchase.bind(this));
			this.addRoute(
				'/:id/redeem/:token',
				this.showRedeemToken.bind(this)
			);
			this.addRoute(
				'/:id/paymentcomplete',
				this.showPaymenComplete.bind(this)
			);
			this.addRoute(
				'/invitations/accept/:code',
				this.showRedeemInvite.bind(this)
			);

			this.addDefaultRoute('/');
			// this.on('beforeclose', this.onBeforeClose, this);

			this.mon(
				this.CourseStore,
				'update-available-courses',
				this.updateCourses.bind(this)
			);
		},

		setupCourses: function (current, upcoming) {
			const me = this;
			const archivedLoader = () => {
				const archived = me.CourseStore.getAllArchivedCourses();
				if (!archived) {
					// need to lazy load
					return me.CourseActions.loadAllArchivedCourses().then(
						() => {
							return me.CourseStore.getAllArchivedCourses();
						}
					);
				}

				return Promise.resolve(archived);
			};

			// if the tab panel component has already done the deferred archived item loading once, just re-use those items
			this.updateAvailableCourses(
				current,
				upcoming,
				this.tabpanel.loadedArchivedItems || [],
				archivedLoader
			);

			if (this.loadingArchived) {
				// still loading, don't remove mask
				return;
			}

			if (!this.tabpanel || this.tabpanel.activeTab) {
				this.removeMask();
				return;
			}

			this.removeMask();
		},

		beforeRender: function () {
			this.callParent(arguments);

			this.renderData = Ext.apply(this.renderData || {}, {
				label: this.label,
			});
		},

		afterRender: function () {
			this.callParent(arguments);
			var me = this;

			me.msgMonitors = me.mon(me.msgContainerEl, {
				click: function (e) {
					if (e.getTarget('.close-msg')) {
						me.closeMsg();
						return;
					}

					var msg = me.msgEl.getAttribute('data-message');
					var isError = /true/i.test(
						me.msgEl.getAttribute('data-message-is-error')
					);
					var msgid = me.msgEl.getAttribute('data-message-id');

					me.fireEvent('message-clicked', msgid, isError, msg);
				},
			});

			me.mon(me.el, 'click', function (e) {
				if (e.getTarget('.close')) {
					me.handleClose();
				}

				if (e.getTarget('.back')) {
					me.showPrevItem();
				}
			});

			me.mon(me.footerEl, 'click', 'handleButtonClick');

			me.on({
				'show-msg': 'showMsg',
				'close-msg': 'closeMsg',
				'update-buttons': 'updateButtons',
				'go-back': 'showPrevItem',
				'show-detail': function (course) {
					wait().then(function () {
						if (
							me.courseDetail &&
							me.courseDetail.course === course
						) {
							me.showPrevItem('course-enrollment-details');
						} else {
							me.showCourse(course);
						}
					});
				},
			});

			me.on('destroy', function () {
				// For first time login, remove the login link to avoid presenting the user with OOBE again.
				if (
					$AppConfig.userObject.hasLink('first_time_logon') &&
					isFlag('suggest-contacts')
				) {
					$AppConfig.userObject.removeFirstTimeLoginLink();
				}
			});

			me.updateButtons();
		},

		handleClose: function () {
			if (this.doClose) {
				this.doClose();
			}
		},

		updateAvailableCourses: function (
			current,
			upcoming,
			archived,
			archivedLoader
		) {},

		allowNavigation: function () {
			var active = this.getLayout().getActiveItem();

			if (active.stopClose) {
				return active.stopClose();
			}

			return true;
		},

		//TODO: this needs to be needs to be allowNavigation
		onBeforeClose: function () {
			var me = this,
				active = me.getLayout().getActiveItem(),
				warning;

			if (active && active.stopClose) {
				warning = active.stopClose();
			}

			if (warning) {
				warning.then(function () {
					me.destroy();
				});
				return false;
			}
		},

		showPrevItem: function (xtype) {
			var current = this.getLayout().getActiveItem(),
				course;

			if (current.xtype === xtype) {
				return;
			}

			if (current.is('course-enrollment-details')) {
				if (!this.courseDetail.changingEnrollment) {
					course = current.course;

					this.courseDetail.destroy();
					delete this.courseDetail;
					this.pushRoute(null, '/', { course: course });
				}
			}

			if (current.is('enrollment-process')) {
				course = current.course;
				if (course) {
					delete this.courseEnrollment;
					this.pushRoute(
						course.get('Title'),
						encodeForURI(course.getId()),
						{ course: course }
					);
				}
			}
		},

		/**
		 * show the message bar across the top of the window
		 *
		 * @param  {string}	 msg  the message to display
		 * @param  {boolean} isError  whether or not we are showing an error
		 * @param  {number} timeout	 timeout...
		 * @param  {string} msgid  id of the message element
		 * @param  {boolean} cursor  -
		 * @returns {void} fulfill if there is a click handler on click, and reject on close
		 */
		showMsg: function (msg, isError, timeout, msgid, cursor) {
			var me = this;

			me.msgContainerEl[isError ? 'addCls' : 'removeCls']('error');
			me.msgEl.update(msg);
			me.msgEl.set({
				'data-message': msg,
				'data-message-is-error': isError,
				'data-message-id': msgid,
			});

			me.bodyEl.addCls('has-msg');
			me.msgContainerEl.addCls('show');

			if (cursor) {
				me.msgContainerEl.addCls('link');
			} else {
				me.msgContainerEl.removeCls('link');
			}

			if (timeout && Ext.isNumber(timeout)) {
				wait(timeout).then(function () {
					me.closeMsg();
				});
			}
		},

		closeMsg: function () {
			if (!this.rendered) {
				return;
			}
			this.bodyEl.removeCls('has-msg');
			this.msgContainerEl.removeCls(['show', 'link']);
			this.msgEl.update('');
		},

		updateButtons: function () {
			var active = this.getLayout().getActiveItem(),
				btnCfg = active && active.getButtonCfg && active.getButtonCfg();

			this.applyButtonCfg(btnCfg || this.buttonCfg);
		},

		applyButtonCfg: function (cfgs) {
			var me = this;

			//make sure its an array
			cfgs = Ext.isArray(cfgs) ? cfgs : [cfgs];

			//clear out the old buttons
			if (me.footerEl) {
				me.footerEl.update('');

				cfgs.forEach(function (cfg) {
					cfg.disabled = cfg.disabled ? 'disabled' : '';
					cfg.secondary = cfg.secondary ? 'secondary' : '';

					me.btnTpl.append(me.footerEl, cfg);
				});
			}
		},

		handleButtonClick: function (e) {
			var btn = e.getTarget('.button'),
				active,
				action;

			btn = btn && Ext.get(btn);

			if (!btn || btn.hasCls('disabled')) {
				return;
			}

			action = btn.getAttribute('data-action');

			if (action === 'close') {
				this.handleClose();
			} else if (action === 'go-back') {
				this.showPrevItem();
			} else {
				active = this.getLayout().getActiveItem();
				active.buttonClick(action);
			}
		},

		updateCourses: function () {
			var me = this,
				current = me.CourseStore.getAllCurrentCourses(),
				upcoming = me.CourseStore.getAllUpcomingCourses();

			me.updateAvailableCourses(current, upcoming, []);
		},

		showTabpanel: function (code) {
			var me = this;

			if (!me.tabpanel) {
				me.tabpanel = me.add({
					xtype: 'library-availalble-courses-page',
					upcoming: me.upcoming,
					current: me.current,
					archived: me.archived,
					code: code || '',
					updateCourses: me.updateCourses.bind(me),
					showMessage: me.showMsg.bind(me),
					ownerCt: me,
				});

				me.mon(me.tabpanel, 'show-course-detail', function (course) {
					me.pushRoute(
						course.get('Title'),
						encodeForURI(course.getId()),
						{ course: course }
					);
				});
			}

			function updateLabel() {
				me.labelEl.removeCls('back');
				me.labelEl.update(me.label);

				me.footerEl.removeCls('enroll');
			}

			if (!me.rendered) {
				me.on('afterrender', updateLabel);
			} else {
				updateLabel();
			}

			me.closeMsg();
			me.getLayout().setActiveItem(me.tabpanel);
			me.updateButtons();
		},

		showCourses: function (route, subRoute) {
			let code = route.params.code;

			this.previouslySelectedCourse = route.precache.course;

			this.addMask();

			const me = this;

			Promise.all([
				this.CourseActions.loadAllCurrentCourses(),
				this.CourseActions.loadAllUpcomingCourses(),
			]).then(() => {
				me.setupCourses(
					me.CourseStore.getAllCurrentCourses(),
					me.CourseStore.getAllUpcomingCourses()
				);
			});

			this.addMask();
			this.showTabpanel(code);
		},

		showCourseDetail: function (route, subRoute, notFoundMsg) {
			var ntiid = decodeFromURI(route.params.id),
				course = route.precache.course,
				q = route.queryParams;

			if (q && q['library[paymentcomplete]']) {
				// We need to show the most recent enrollent, which should be the course we just enrolled in.
				//TODO figure out what to do here
			}

			if (
				course &&
				course.getId().toLowerCase() === ntiid.toLowerCase()
			) {
				this.showCourse(course);
				this.removeMask();
				return Promise.resolve();
			}

			alert(notFoundMsg || 'Unable to find the course');
		},

		onDrop: function () {
			// this.pushRoute('', '/');
		},

		showCourse: function (course) {
			var me = this;

			function addView() {
				me.courseDetail = me.add({
					xtype: 'course-enrollment-details',
					course: course,
					ownerCt: me,
					onDrop: me.onDrop.bind(me),
				});
			}

			if (!me.courseDetail) {
				addView();
			} else if (me.courseDetail.course !== course) {
				addView();
			} else {
				me.courseDetail.updateEnrollmentCard(true);
			}

			function updateLabel() {
				var activeTab;
				if (!me.isSingle) {
					me.labelEl.addCls('back');
					activeTab = me.tabpanel.getTabForCourse(course);

					me.labelEl.update(
						activeTab.title +
							' ' +
							getString('NextThought.view.library.View.course')
					);
				} else {
					me.labelEl.update(course.get('Title'));
					me.identifierEl.update(course.get('ProviderUniqueID'));
					me.labelEl.removeCls('back');
				}

				me.footerEl.removeCls(['enroll', 'admission']);
			}

			if (!me.rendered) {
				me.on('afterrender', updateLabel);
			} else {
				updateLabel();
			}

			me.mon(me.courseDetail, 'enroll-in-course', 'showEnrollmentOption');
			me.getLayout().setActiveItem(me.courseDetail);
			me.onceRendered.then(function () {
				me.updateButtons();
			});
		},

		showEnrollmentOption: function (course, name, type, config) {
			var me = this;

			function addView() {
				me.courseEnrollment = me.add({
					xtype: 'enrollment-process',
					steps: me.CourseEnrollmentStore.getEnrollmentSteps(
						course,
						name,
						type,
						config
					),
					course: course,
				});
				me.removeMask();
			}

			if (!me.courseEnrollment) {
				addView();
			} else if (me.courseEnrollment.course !== course) {
				addView();
			}

			function updateLabel() {
				me.labelEl.addCls('back');
				me.labelEl.update(course.get('Title'));
			}

			if (!me.rendered) {
				me.on('afterrender', updateLabel);
			} else {
				updateLabel();
			}

			me.mon(me.courseEnrollment, {
				'create-enroll-purchase':
					me.StoreActions.createEnrollmentPurchase.bind(
						me.StoreActions
					),
				'create-gift-purchase':
					me.StoreActions.createEnrollmentPurchase.bind(
						me.StoreActions
					),
				'submit-enroll-purchase':
					me.StoreActions.submitEnrollmentPurchase.bind(
						me.StoreActions
					),
				'submit-gift-purchase': me.StoreActions.submitGiftPurchase.bind(
					me.StoreActions
				),
				'redeem-gift': me.StoreActions.redeemGift.bind(me.StoreActions),
				'enrollment-enrolled-complete':
					me.CourseEnrollmentActions.refreshEnrolledCourses.bind(
						me.CourseEnrollmentActions
					),
			});

			me.getLayout().setActiveItem(me.courseEnrollment);

			me.updateButtons();
			me.closeMsg();
		},

		showPaymenComplete: function (route, subRoute) {
			var mostRecent = route.precache.course;

			if (
				mostRecent &&
				mostRecent.getEnrollmentOption('FiveminuteEnrollment')
			) {
				this.showEnrollmentOption(mostRecent, 'FiveminuteEnrollment');
				return Promise.resolve;
			}

			return this.showCourseDetail(route, subRoute);
		},

		async showRedeemToken(route, subRoute) {
			let email = (await getService()).getSupportLinks().supportContact;

			const ensureProtocol = x =>
				!x || /^(mailto|https?):/i.test(x) ? x : `mailto:${x}`;

			return this.showCourseDetail(
				route,
				subRoute,
				'This course is not redeemable by this account. Please contact <a href="' +
					ensureProtocol(email) +
					'">Support.</a>'
			).then(() => {
				if (this.courseDetail) {
					this.courseDetail.restoreEnrollmentOption('redeem', [
						route.params.token,
					]);
				}
			});
		},

		showRedeemInvite(route, subRoute) {
			return this.showCourses(route, subRoute);
		},

		showForCredit: function (route, subRoute) {
			var me = this;

			return me.showCourseDetail(route, subRoute).then(function () {
				if (me.courseDetail) {
					me.courseDetail.restoreEnrollmentOption('forcredit');
				}
			});
		},

		showPurchase: function (route, subRoute) {
			var me = this;

			me.showCourseDetail(route, subRoute).then(function () {
				if (me.courseDetail) {
					me.courseDetail.restoreEnrollmentOption('purchase');
				}
			});
		},

		addMask: function () {
			if (this.rendered) {
				this.el.mask('Loading...');
			}
		},

		removeMask: function () {
			if (this.rendered) {
				this.el.unmask();
			}
		},

		updateLabelText: function (text) {
			if (Ext.isEmpty(text)) {
				return;
			}
			this.labelEl.update(text);
		},
	}
);

Ext.define('NextThought.app.library.courses.components.available.CourseWindow', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.library-available-courses-window',

	requires: [
		'NextThought.app.course.catalog.Collection',
		'NextThought.app.library.courses.components.available.Actions',
		// 'NextThought.app.library.courses.components.available.CoursePage',
		'NextThought.app.library.courses.StateStore',
		'NextThought.app.course.enrollment.Details',
		'NextThought.app.course.enrollment.StateStore',
		'NextThought.app.course.enrollment.Details',
		'NextThought.app.course.enrollment.components.Process',
		'NextThought.app.store.Actions'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	floating: true,

	label: 'Add Courses',

	constrainTo: Ext.getBody(),
	width: 1024,
	height: '85%',
	dialog: true,
	header: false,
	componentLayout: 'natural',
	layout: 'card',

	cls: 'available-courses',

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],
	getDockedItems: function() { return []; },

	/**
	 * Ext is shooting us in the foot when it tries to center it
	 * so for now just don't let Ext do anything here.
	 */
	setPosition: function() {},


	/**
	 * This is always going to be positioned  fixed, so don't
	 * let Ext layout try to calculate according to parents.
	 */
	center: function() {
		if (!this.rendered) {
			this.on('afterrender', this.center.bind(this));
			return;
		}

		var dom = this.el && this.el.dom,
			myWidth = this.getWidth(),
			myHeight = this.getHeight(),
			viewWidth = Ext.Element.getViewportWidth(),
			viewHeight = Ext.Element.getViewportHeight(),
			top, left;

		top = (viewHeight - myHeight) / 2;
		left = (viewWidth - myWidth) / 2;

		top = Math.max(top, 0);
		left = Math.max(left, 0);

		dom.style.top = top + 'px';
		dom.style.left = left + 'px';
	},

	buttonCfg: [
		{name: getString('NextThought.view.library.available.CourseWindow.Finished'), action: 'close'}
	],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'name', html: '{label}'},
			{cls: 'close'}
		]},
		{cls: 'msg-container', cn: [
			{cls: 'msg'},
			{cls: 'close-msg'}
		]},
		{ id: '{id}-body', cls: 'body-container',
			cn: ['{%this.renderContainer(out,values)%}'] },
		{cls: 'footer'}
	]),

	btnTpl: new Ext.XTemplate(Ext.DomHelper.markup({cls: 'button {disabled} {secondary}', 'data-action': '{action}', html: '{name}'})),


	renderSelectors: {
		labelEl: '.header .name',
		msgContainerEl: '.msg-container',
		msgEl: '.msg-container .msg',
		bodyEl: '.body-container',
		footerEl: '.footer'
	},


	restore: function(state) {
		var me = this;

		function finish(catalogEntry, fulfill) {
			delete state.paymentcomplete;

			if (catalogEntry) {
				me.showEnrollmentOption(catalogEntry, 'FiveminuteEnrollment');
			}

			fulfill();
		}

		return new Promise(function(fulfill) {
			if (state.paymentcomplete) {
				CourseWareUtils.getMostRecentEnrollment()
					.then(function(course) {
						if (!course) {
							console.error('No Course to restore state to');
						} else {
							finish(course.getCourseCatalogEntry(), fulfill);
						}
					})
					.fail(function(reason) {
						if (!state.cce) {
							return Promise.reject('No most recent enrollment, or cce to return to');
						} else {
							return CourseWareUtils.courseForNtiid(state.cce);
						}
					})
					.then(function(entry) {
						if (!entry) {
							return Promise.reject('No cce for ' + state.cce);
						} else {
							finish(entry, fulfill);
						}
					}).
					fail(function(reason) {
						console.error('unable to return from payment: ', reason);
						finish(false, fulfill);
					});
			} else if (state.enrollmentOption) {
				if (!me.courseDetail) {
					console.error('Trying to restore an enrollment option without an active course set:', state);
					fulfill();
				} else {
					me.courseDetail.restoreEnrollmentOption(state.enrollmentOption, state.enrollmentConfig);
					fulfill();
				}
			} else {
				fulfill();
			}
		});
	},


	initComponent: function() {
		this.callParent(arguments);

		this.CourseActions = NextThought.app.library.courses.Actions.create();
		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		this.CourseEnrollmentStore = NextThought.app.course.enrollment.StateStore.getInstance();
		this.CourseEnrollmentActions = NextThought.app.course.enrollment.Actions.create();
		this.StoreActions = NextThought.app.store.Actions.create();

		this.initRouter();

		this.addRoute('/', this.showCourses.bind(this));
		this.addRoute('/:id', this.showCourseDetail.bind(this));
		this.addRoute('/:id/forcredit', this.showForCredit.bind(this));
		this.addRoute('/:id/redeem/:token', this.showRedeemToken.bind(this));
		this.addRoute('/:id/paymentcomplete', this.showPaymenComplete.bind(this));

		this.addDefaultRoute('/');
		// this.on('beforeclose', this.onBeforeClose, this);

		this.mon(this.CourseStore, 'update-available-courses', this.updateCourses.bind(this));
	},


	setupCourses: function(courses) {
		var current = this.CourseStore.getAllCurrentCourses(),
			archived = this.CourseStore.getAllArchivedCourses();
			upcoming = this.CourseStore.getAllUpcomingCourses();

		this.updateAvailableCourses(current, upcoming, archived);
		if (!this.tabpanel || this.tabpanel.activeTab) {
			this.removeMask();
			return;
		}

		this.removeMask();
	},

	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.label
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.addMask();
		var me = this;

		me.msgMonitors = me.mon(me.msgContainerEl, {
			'click': function(e) {
				if (e.getTarget('.close-msg')) {
					me.closeMsg();
					return;
				}

				var msg = me.msgEl.getAttribute('data-message');
				var isError = (/true/i).test(me.msgEl.getAttribute('data-message-is-error'));
				var msgid = me.msgEl.getAttribute('data-message-id');

				me.fireEvent('message-clicked', msgid, isError, msg);
			}
		});

		me.mon(me.el, 'click', function(e) {
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
			'show-detail': function(course) {
				wait()
					.then(function() {
						if (me.courseDetail && me.courseDetail.course === course) {
							me.showPrevItem('course-enrollment-details');
						} else {
							me.showCourse(course);
						}
					});
			}
		});

		me.on('destroy', function() {
			// For first time login, remove the login link to avoid presenting the user with OOBE again.
			if ($AppConfig.userObject.hasLink('first_time_logon') && isFeature('suggest-contacts')) {
				$AppConfig.userObject.removeFirstTimeLoginLink();
			}
		});

		me.updateButtons();
	},

	handleClose: function() {
		if (this.doClose) {
			this.doClose();
		}
	},

	updateAvailableCourses: function(current, upcoming, archived) {
		if (!this.tabpanel) { return; }

		this.tabpanel.setItems(upcoming, current, archived);
	},


	allowNavigation: function() {
		var active = this.getLayout().getActiveItem();

		if (active.stopClose) {
			return active.stopClose();
		}

		return true;
	},


	//TODO: this needs to be needs to be allowNavigation
	onBeforeClose: function() {
		var me = this,
			active = me.getLayout().getActiveItem(),
			warning;

		if (active && active.stopClose) {
			warning = active.stopClose();
		}

		if (warning) {
			warning
				.then(function() {
					me.destroy();
				});
			return false;
		}
	},


	showPrevItem: function(xtype) {
		var current = this.getLayout().getActiveItem(),
			course;

		if (current.xtype === xtype) { return; }

		if (current.is('course-enrollment-details')) {
			if (!this.courseDetail.changingEnrollment) {
				this.courseDetail.destroy();
				delete this.courseDetail;
				this.pushRoute(null, '/');
			}
		}

		if (current.is('enrollment-process')) {
			course = current.course;
			if (course) {
				delete this.courseEnrollment;
				this.pushRoute(course.get('Title'), ParseUtils.encodeForURI(course.getId()), {course: course});
			}
		}
	},

	/**
	 * show the message bar across the top of the window
	 * @param  {string}  msg  the message to display
	 * @param  {Boolean} isError  whether or not we are showing an error
	 * @param  {Number} timeout  timeout...
	 * @param  {String} msgid  id of the message element
	 * @return {Promise} fulfill if there is a click handler on click, and reject on close
	 */
	showMsg: function(msg, isError, timeout, msgid, cursor) {
		var me = this;

		me.msgContainerEl[isError ? 'addCls' : 'removeCls']('error');
		me.msgEl.update(msg);
		me.msgEl.set({
			'data-message': msg,
			'data-message-is-error': isError,
			'data-message-id': msgid
		});

		me.bodyEl.addCls('has-msg');
		me.msgContainerEl.addCls('show');

		if (cursor) {
			me.msgContainerEl.addCls('link');
		} else {
			me.msgContainerEl.removeCls('link');
		}

		if (timeout && Ext.isNumber(timeout)) {
			wait(timeout)
				.then(function() {
					me.closeMsg();
				});
		}
	},

	closeMsg: function() {
		if (!this.rendered) { return; }
		this.bodyEl.removeCls('has-msg');
		this.msgContainerEl.removeCls(['show', 'link']);
		this.msgEl.update('');
	},


	updateButtons: function() {
		var active = this.getLayout().getActiveItem(),
			btnCfg = active && active.getButtonCfg && active.getButtonCfg();

		this.applyButtonCfg(btnCfg || this.buttonCfg);
	},


	applyButtonCfg: function(cfgs) {
		var me = this;

		//make sure its an array
		cfgs = Ext.isArray(cfgs) ? cfgs : [cfgs];

		//clear out the old buttons
		if (me.footerEl) {
			me.footerEl.update('');
		}

		cfgs.forEach(function(cfg) {
			cfg.disabled = cfg.disabled ? 'disabled' : '';
			cfg.secondary = cfg.secondary ? 'secondary' : '';

			me.btnTpl.append(me.footerEl, cfg);
		});
	},


	handleButtonClick: function(e) {
		var btn = e.getTarget('.button'),
			active, action;

		btn = btn && Ext.get(btn);

		if (!btn || btn.hasCls('disabled')) { return; }

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


	updateCourses: function() {
		var me = this,
			current = me.CourseStore.getAllCurrentCourses(),
			archived = me.CourseStore.getAllArchivedCourses(),
			upcoming = me.CourseStore.getAllUpcomingCourses();

		me.updateAvailableCourses(current, upcoming, archived);
	},

	showTabpanel: function() {
		var me = this;

		if (!me.tabpanel) {
			me.tabpanel = me.add({
				xtype: 'library-availalble-courses-page',
				upcoming: me.upcoming,
				current: me.current,
				archived: me.archived,
				ownerCt: me
			});

			me.mon(me.tabpanel, 'show-course-detail', function(course) {
				me.pushRoute(course.get('Title'), ParseUtils.encodeForURI(course.getId()), {course: course});
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

		me.getLayout().setActiveItem(me.tabpanel);
		me.updateButtons();
	},


	showCourses: function(route, subRoute) {
		this.mun(this.CourseStore, 'all-courses-set');
		this.mon(this.CourseStore, 'all-courses-set', this.setupCourses.bind(this));
		this.addMask();
		this.CourseActions.loadAllCourses();
		this.showTabpanel();
	},


	showCourseDetail: function(route, subRoute, notFoundMsg) {
		var ntiid = ParseUtils.decodeFromURI(route.params.id),
			course = route.precache.course,
			q = route.queryParams,
			me = this, isEnrollmentConfirmation = false;

		if (course && course.getId().toLowerCase() === ntiid.toLowerCase()) {
			this.showCourse(course);
			return Promise.resolve();
		}

		if (q && q['library[paymentcomplete]']) {
			// We need to show the most recent enrollent, which should be the course we just enrolled in.
			isEnrollmentConfirmation = true;
		}

		notFoundMsg = notFoundMsg || 'Unable to find the course';

		return new Promise(function(fulfill, reject) {
			me.mun(me.CourseStore, 'all-courses-set');
			me.mon(me.CourseStore, {
				'all-courses-set': function(courses) {
					me.showTabpanel();
					me.addMask();
					me.setupCourses(courses);


					course = me.CourseStore.findCourseForNtiid(ntiid) ||
							isEnrollmentConfirmation && me.CourseStore.getMostRecentEnrollmentCourse();

					if (course) {
						wait()
							.then(function() {
								me.showCourse(course);
								fulfill();
							});
					} else {
						me.showTabpanel();

						wait()
							.then(alert.bind(null, notFoundMsg));

						fulfill();
					}
				}
			});
			me.CourseActions.loadAllCourses();
		});
	},


	onDrop: function() {
		this.pushRoute('', '/');
	},


	showCourse: function(course) {
		var me = this;

		function addView() {
			me.courseDetail = me.add({
				xtype: 'course-enrollment-details',
				course: course,
				ownerCt: me,
				onDrop: me.onDrop.bind(me)
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

				me.labelEl.update(activeTab.title + ' Courses');
			} else {
				me.labelEl.update(course.get('Title'));
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
		me.onceRendered.then(function() {
			me.updateButtons();
		});
	},


	showEnrollmentOption: function(course, name, type, config) {
		var me = this;

		function addView() {
			me.courseEnrollment = me.add({
				xtype: 'enrollment-process',
				steps: me.CourseEnrollmentStore.getEnrollmentSteps(course, name, type, config),
				course: course
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
			'create-enroll-purchase': me.StoreActions.createEnrollmentPurchase.bind(me.StoreActions),
			'create-gift-purchase': me.StoreActions.createEnrollmentPurchase.bind(me.StoreActions),
			'submit-enroll-purchase': me.StoreActions.submitEnrollmentPurchase.bind(me.StoreActions),
			'submit-gift-purchase': me.StoreActions.submitGiftPurchase.bind(me.StoreActions),
			'redeem-gift': me.StoreActions.redeemGift.bind(me.StoreActions),
			'enrollment-enrolled-complete': me.CourseEnrollmentActions.refreshEnrolledCourses.bind(me.CourseEnrollmentActions)
		});

		me.getLayout().setActiveItem(me.courseEnrollment);

		me.updateButtons();
		me.closeMsg();
	},


	showPaymenComplete: function(route, subRoute) {
		var mostRecent = this.CourseStore.getMostRecentEnrollmentCourse();

		this.showTabpanel();

		if (mostRecent && mostRecent.getEnrollmentOption('FiveminuteEnrollment')) {
			this.showEnrollmentOption(mostRecent, 'FiveminuteEnrollment');
			return Promise.resolve;
		}

		return this.showCourseDetail(route, subRoute);
	},


	showRedeemToken: function(route, subRoute) {
		var me = this,
			//TODO: a better system for getting this email
			email = Service.getSupportLinks().email || 'support@nextthought.com';

		return me.showCourseDetail(route, subRoute, 'This course is not redeemable by this account. Please contact <a href="mailto:' + email + '">Support.</a>')
			.then(function() {
				if (me.courseDetail) {
					me.courseDetail.restoreEnrollmentOption('redeem', [route.params.token]);
				}
			});
	},


	showForCredit: function(route, subRoute) {
		var me = this;

		return me.showCourseDetail(route, subRoute)
			.then(function() {
				if (me.courseDetail) {
					me.courseDetail.restoreEnrollmentOption('forcredit');
				}
			});
	},


	addMask: function() {
		if (this.rendered) {
			this.el.mask('Loading...');
		}
	},

	removeMask: function() {
		if (this.rendered) {
			this.el.unmask();
		}
	},

	updateLabelText: function(text) {
		if (Ext.isEmpty(text)) { return; }
		this.labelEl.update(text);
	}
});

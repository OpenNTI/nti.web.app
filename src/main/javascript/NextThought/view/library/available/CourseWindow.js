Ext.define('NextThought.view.library.available.CourseWindow', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.library-available-courses-window',

	requires: [
		'NextThought.view.courseware.coursecatalog.Collection',
		'NextThought.view.courseware.coursecatalog.TabPanel',
		'NextThought.view.courseware.enrollment.Details',
		'NextThought.view.courseware.enrollment.Process'
	],

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
	center: Ext.emptyFn,

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

		var course;

		if (this.showAvailable) {
			this.showTabpanel();
		}

		if (this.course) {
			this.showCourse(this.course);
		} else if (this.activeId) {
			course = CourseWareUtils.courseForNtiid(this.activeId);

			if (course) {
				this.showCourse(course);
			} else {
				console.error('Faild to load active id, ', this.activeId);
			}
		}

		this.on('beforeclose', this.onBeforeClose, this);
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			label: this.label
		});
	},


	afterRender: function() {
		this.callParent(arguments);

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
				me.close();
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

		me.updateButtons();
	},


	updateAvailableCourses: function(current, upcoming, archived) {
		if (!this.tabpanel) { return; }

		if (current) {
			this.tabpanel.updateCurrent(current);
		}

		if (upcoming) {
			this.tabpanel.updateUpcoming(upcoming);
		}

		if (archived) {
			this.tabpanel.updateArchived(archived);
		}
	},


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
		var me = this, p,
			current = this.getLayout().getActiveItem();

		if (current.xtype === xtype) { return; }

		if (current.stopClose) {
			p = current.stopClose();
		} else {
			p = new Promise.resolve();
		}

		return p.then(function() {
			if (current.is('course-enrollment-details')) {
				me.showTabpanel();

				me.courseDetail.destroy();
				delete me.courseDetail;
			}

			if (current.is('enrollment-process')) {
				me.showCourse(current.course);
				delete me.courseEnrollment;
			}

			me.updateButtons();
			current.destroy();
		});
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
		me.footerEl.update('');

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
			this.close();
		} else if (action === 'go-back') {
			this.showPrevItem();
		} else {
			active = this.getLayout().getActiveItem();
			active.buttonClick(action);
		}


	},


	showTabpanel: function() {
		if (!this.showAvailable) { return; }

		var me = this;

		if (!me.tabpanel) {
			me.tabpanel = me.add({
				xtype: 'course-catalog-tabpanel',
				upcoming: me.upcoming,
				current: me.current,
				archived: me.archived,
				ownerCt: me
			});

			me.mon(me.tabpanel, 'show-course-detail', 'showCourse');
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
	},


	showCourse: function(course) {
		var me = this;

		function addView() {
			me.courseDetail = me.add({
				xtype: 'course-enrollment-details',
				course: course,
				ownerCt: me
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
			if (me.showAvailable) {
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
	},


	showEnrollmentOption: function(course, name, type, config) {
		var me = this;

		function addView() {
			me.courseEnrollment = me.add({
				xtype: 'enrollment-process',
				steps: CourseWareUtils.Enrollment.getEnrollmentSteps(course, name, type, config),
				course: course
			});
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

		me.getLayout().setActiveItem(me.courseEnrollment);
		me.closeMsg();
	}
});

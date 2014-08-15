Ext.define('NextThought.view.library.available.CourseWindow', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.library-available-courses-window',

	requires: [
		'NextThought.view.courseware.coursecatalog.Collection',
		'NextThought.view.courseware.coursecatalog.TabPanel',
		'NextThought.view.courseware.enrollment.credit.View',
		'NextThought.view.courseware.enrollment.Details'
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
		{cls: 'footer', cn: [
			{cls: 'done button close detail', html: 'Finished'},
			{cls: 'button admission enrollment submit disabled', html: 'Submit Application'},
			{cls: 'button enroll enrollment submit', html: 'Continue to Payment'},
			{cls: 'button enroll enrollment cancel', html: 'Cancel'},
			{cls: 'button admission enrollment cancel', html: 'Cancel'},
			{cls: 'button error enrollment cancel', html: 'Cancel'}
		]}
	]),


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
				me.showAdmission(catalogEntry, true);
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

			if (e.getTarget('.enrollment') && !e.getTarget('.disabled')) {
				me.enrollmentOptionClicked(e);
			}
		});

		me.on({
			'show-msg': 'showMsg',
			'enable-submission': 'enableSubmit',
			'set-window-btns': 'setWindowBtns',
			'show-detail': function(course) {
				wait()
					.then(function() {
						if (me.courseDetail && me.courseDetail.course === course) {
							me.showPrevItem('course-enrollment-details');
							me.courseDetail.updateEnrollmentCard();

							me.getLayout().setActiveItem(me.courseDetail);
						} else {
							me.showCourse(course);
						}
					});
			}
		});
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
			warning;

		//Iterate through all the items and see if they care if the window is closed
		me.items.each(function(item) {
			if (item.stopClose) {
				//stopWindowClose should return a promise
				//that on success will allow the window to close
				// and on fail will prevent the window to close
				warning = item.stopClose();

				return false;
			}
		});

		if (warning) {
			warning
				.then(function() {
					//close the window;
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

		p.then(function() {
			if (current.is('course-enrollment-details')) {
				me.showTabpanel();

				me.courseDetail.destroy();
				delete me.courseDetail;
			}

			if (current.is('enrollment-credit')) {
				me.showCourse(current.course);
				delete me.courseEnrollment;
			}

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

		if (timeout) {
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


	setWindowBtns: function(cls) {
		this.footerEl.removeCls(this.windowbtncls);
		this.windowbtncls = cls;
		this.footerEl.addCls(cls);
	},


	enableSubmit: function(enable) {
		this.footerEl.down('.submit')[enable ? 'removeCls' : 'addCls']('disabled');
	},


	enrollmentOptionClicked: function(e) {
		var admission, enroll;

		if (e.getTarget('.cancel')) {
			this.showPrevItem();
			return;
		}

		if (!this.courseEnrollment) {
			console.error('not in the enrollment process, why can you click an enroll');
			return;
		}

		if (e.getTarget('.admission.submit')) {
			this.courseEnrollment.maybeSubmitApplication();
		}

		if (e.getTarget('.enroll.submit')) {
			this.courseEnrollment.maybeSubmitEnrollment();
		}
	},


	admissionComplete: function() {
		if (!this.courseDetail) {
			console.error('No course detail to go back to');
			return;
		}

		this.courseDetail.updateEnrollmentCard();
		this.getLayout().setActiveItem(this.courseDetail);
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
		me.closeMsg();
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
			me.courseDetail.updateEnrollmentCard();
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

		me.mon(me.courseDetail, 'enroll-for-credit', 'showAdmission');

		me.getLayout().setActiveItem(me.courseDetail);
		me.closeMsg();
	},


	showAdmission: function(course, paymentcomplete) {
		var me = this;

		function addView() {
			me.courseEnrollment = me.add({
				xtype: 'enrollment-credit',
				course: course,
				paymentcomplete: paymentcomplete,
				ownerCt: me
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

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
			{cls: 'button enroll submit disabled', html: 'Submit Application'},
			{cls: 'button enroll cancel', html: 'Cancel'}
		]}
	]),


	renderSelectors: {
		labelEl: '.header .name',
		msgContainerEl: '.msg-container',
		msgEl: '.msg-container .msg',
		bodyEl: '.body-container',
		footerEl: '.footer'
	},


	initComponent: function() {
		this.callParent(arguments);

		if (this.showAvailable) {
			this.showTabpanel();
		}

		if (this.course) {
			this.showCourse(this.course);
		}
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

		me.mon(me.el, 'click', function(e) {
			if (e.getTarget('.close')) {
				me.close();
			}

			if (e.getTarget('.back')) {
				me.showPrevItem();
			}

			if (e.getTarget('.enroll')) {
				me.enrollOptionClicked(e);
			}
		});

		me.on({
			'show-msg': 'showMsg',
			'enable-submission': 'enableSubmit'
		});
	},

	showPrevItem: function() {
		var current = this.getLayout().getActiveItem();

		if (!current.fireEvent('beforedeactivate')) {
			return;
		}

		if (current.is('course-enrollment-details')) {
			this.showTabpanel();
		}

		if (current.is('enrollment-credit')) {
			this.showCourse(current.course);
		}
	},

	/**
	 * show the message bar across the top of the window
	 * @param  {string}  msg             the message to display
	 * @param  {Boolean} isError         whether or not we are showing an error
	 * @param  {Boolean} hasClickHandler if there is a function to handle the click
	 * @return {Promise}                  fulfill if there is a click handler on click, and reject on close
	 */
	showMsg: function(msg, isError, timeout, hasClickHandler) {
		var me = this;

		me.msgContainerEl[isError ? 'addCls' : 'removeCls']('error');
		me.msgEl.update(msg);

		me.bodyEl.addCls('has-msg');
		me.msgContainerEl.addCls('show');

		if (timeout) {
			wait(timeout)
				.then(function() {
					me.closeMsg();
				});
		}

		return new Promise(function(fulfill, reject) {
			me.msgMonitors = me.mon(me.msgContainerEl, {
				'single': true,
				'click': function(e) {
					if (e.getTarget('.close-msg')) {
						me.closeMsg();
						reject();
						return;
					}

					if (hasClickHandler) {
						fulfill();
					}
				}
			});
		});
	},


	closeMsg: function() {
		if (!this.rendered) { return; }
		this.bodyEl.removeCls('has-msg');
		this.msgContainerEl.removeCls('show');
	},


	enableSubmit: function(enable) {
		this.footerEl.down('.submit')[enable ? 'removeCls' : 'addCls']('disabled');
	},


	enrollOptionClicked: function(e) {
		var admission = this.courseEnrollment && this.courseEnrollment.down('enrollment-credit-admission');

		if (e.getTarget('.cancel')) {
			this.showPrevItem();
			return;
		}

		if (e.getTarget('.submit')) {
			if (!admission) {
				console.error('no admission form');
				return;
			}

			admission.maybeSubmitApplication();
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
				archived: me.archived
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

		me.courseDetail = me.add({
			xtype: 'course-enrollment-details',
			course: course
		});


		function updateLabel() {
			if (me.showAvailable) {
				me.labelEl.addCls('back');
				activeTab = me.tabpanel.getActiveTab();

				me.labelEl.update(activeTab.title + ' Courses');
			} else {
				me.labelEl.update(course.get('Title'));
			}

			me.footerEl.removeCls('enroll');
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


	showAdmission: function(course) {
		var me = this;

		function addView() {
			me.courseEnrollment = me.add({
				xtype: 'enrollment-credit',
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

			me.footerEl.addCls('enroll');
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

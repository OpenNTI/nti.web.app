Ext.define('NextThought.view.courseware.enrollment.Details', {
	extend: 'Ext.Component',
	alias: 'widget.course-enrollment-details',

	cls: 'course-details',

	enrollmentCardTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{cls: 'enroll-card', cn: [
			{cls: 'top {top.cls}', cn: [
				{cls: 'title', html: '{top.title}'},
				{cls: 'info', html: '{top.information}'},
				{tag: 'tpl', 'for': 'top.links', cn: [
					{tag: 'a', cls: 'link', href: '{href}', target: '_blank', html: '{text}'}
				]}
			]},
			{cls: 'bottom {bottom.cls}', cn: [
				{cls: 'title', html: '{bottom.title}'},
				{cls: 'price', html: '{price}'},
				{cls: 'info', html: '{bottom.information}'},
				{cls: 'warning', html: '{bottom.warning}'}
			]},
			{cls: 'button {buttonCls}', html: '{buttonText}'}
		]}
	)),


	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'sub', html: '{number}'},
			{cls: 'title', html: '{title}'}
		]},
		{cls: 'left', cn: [
			{cls: 'video'},
			{cls: 'curtain'},
			{tag: 'p', cls: 'description', cn: '{description}'}
		]},
		{cls: 'right enrollment', cn: [
			{cls: 'enrollment-container'}
		]}
	]),


	renderSelectors: {
		videoEl: '.video',
		curtainEl: '.curtain',
		cardsEl: '.enrollment',
		cardsContainerEl: '.enrollment-container'
	},

	listeners: {
		curtainEl: {
			click: 'curtainClicked'
		}
	},


	initComponent: function() {
		this.callParent(arguments);

		this.enableBubble(['enrolled-action', 'show-msg']);

		this.on('beforedeactivate', 'onBeforeDeactivate');
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			number: this.course.get('ProviderUniqueID'),
			title: this.course.get('Title'),
			description: this.course.get('Description')
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.buildVideo();

		me.updateEnrollmentCard();

		me.mon(me.cardsEl, 'click', 'handleEnrollmentClick', me);
	},


	onBeforeDeactivate: function() {
		return !this.changingEnrollment;
	},


	addMask: function() {
		var maskEl = this.el.up('.body-container');

		maskEl.mask('Loading...');
	},


	removeMask: function() {
		var maskEl = this.el.up('.body-container'),
			mask = maskEl.down('.x-mask'),
			maskMsg = maskEl.down('.x-mask-msg');

		mask.addCls('removing');
		maskMsg.addCls('removing');

		wait(1000).then(maskEl.unmask.bind(maskEl));
	},


	buildVideo: function() {
		var me = this,
			videoURL = me.course.get('Video');

		Ext.destroy(me.video, me.videoMonitor);

		if (!Ext.isEmpty(videoURL)) {
			me.video = Ext.widget({
				xtype: 'content-video',
				url: videoURL,
				width: 642,
				playerWidth: 642,
				renderTo: me.videoEl,
				floatParent: me
			});

			me.video.mon(me, 'destroy', 'destroy', me.video);

			this.videoMonitor = this.mon(this.video, {
				destroyable: true,
				'beforerender': {
					fn: function() {
						me.addCls('has-video');
					},
					single: true
				},
				'player-event-ended': {
					fn: 'showCurtain',
					scope: me,
					buffer: 1000
				}
			});
		}
	},


	showCurtain: function() {
		this.removeCls('playing');
		this.buildVideo();
	},


	curtainClicked: function(e) {
		if (e && e.shiftKey && this.player.canOpenExternally()) {
			this.video.openExternally();
		}
		else {
			this.addCls('playing');
			this.video.resumePlayback();
		}
	},


	getEnrollmentData: function() {
		var me = this, catalogData,
			credit = me.course.get('Credit');

		me.admissionstate = $AppConfig.userObject.get('admission_status');

		catalogData = {
			StartDate: me.course.get('StartDate'),
			EndDate: me.course.get('EndDate'),
			EnrollCutOff: me.course.get('EnrollForCreditCutOff'),
			DropCutOff: me.course.get('DropCutOff') || me.course.get('EnrollForCreditCutoff'),
			AvailableForCredit: me.course.get('NTI_FiveminuteEnrollmentCapable'),
			Enrolled: me.course.isActive(),
			OpenEnrolled: me.course.isActive() && !me.course.isEnrolledForCredit(),
			EnrolledForCredit: me.course.isEnrolledForCredit(),
			SeatCount: me.course.seatcount,
			AdmissionState: me.admissionstate,
			Hours: credit && credit[0] && credit[0].get('Hours')
		};

		if (catalogData.Enrolled) {
			return CourseWareUtils.findCourseBy(me.course.findByMyCourseInstance())
				.then(function(instance) {
					catalogData.EnrollStartDate = instance.get('CreatedTime');

					return catalogData;
				})
				.fail(function() {
					return catalogData;
				});
		}

		return Promise.resolve(catalogData);
	},

	/*
		Possible States
			top
				Not Enrolled
				Open Enrolled
				Enrolled for Credit
				Course Archived/ not enrolled
				Course Archived/ open enrolled before
				Course Archived/ open enrolled after
				Course Archived/ enrolled for credit pass
				Course Archived/ enrolled for credit fail

			bottom
				Nothing
				Available for Credit
				Admission Pending
				Admissin Denied
				Enrolled for Credit (How do I drop?)
				Open Course Archived Still available for credit
				Course Archived Earned Credit
				Course Archived Faild to Earn Credit
	 */
	ENROLLMENT_STATES: {
		top: {
			not_enrolled: {
				title: 'Enroll for Free',
				information: [
					'Get complete access to interact with all course content, including lectures,',
					'course materials, quizzes, and discussions once class is in session.'
				].join(' '),
				cls: ''
			},
			open_enrolled: {
				title: 'You are in the Open Course!',
				information: 'Class begins {date} and will be conducted fully online.',
				cls: 'enrolled',
				links: [
					{href: 'welcome', text: 'Get Acquainted with Janux'},
					{href: 'profile', text: 'Complete your Profile'}
				]
			},
			credit_enrolled: {
				title: 'Enrolled for College Credit',
				information: 'Class begins {date} and will be conducted fully online.',
				cls: 'enrolled',
				links: [
					{href: 'welcome', text: 'Get Acquainted with Janux'},
					{href: 'profile', text: 'Complete your Profile'}
				]
			},
			archived_not_enrolled: {
				title: 'This Course is Archived.',
				information: [
					'Archived courses are out of session but all course content will remain available',
					'including the lectures, course materials, quizzes, and discussions.'
				].join(' '),
				cls: ''
			},
			archived_enrolled_before: {
				title: 'You Took the Open Course!',
				information: [
					'Thanks for your participation in OU Janux!',
					'The content of this course will remain available for you to review at any time.'
				].join(' '),
				cls: ''
			},
			archived_enrolled_for_credit: {
				title: 'Enrolled for College Credit!',
				information: [
					'Thanks for your participation in OU Janux!',
					'The content of the course will remain available for you to review at any time.'
				].join(' '),
				cls: ''
			}
		},
		bottom: {
			not_enrolled: {
				title: 'Earn College Credit',
				information: 'Earn transcripted college credit from the University of Oklahoma.',
				warning: 'Not available until {date}.',
				cls: 'checkbox'
			},
			admission_pending: {
				title: 'Admission Pending...',
				information: [
					'We\'re processing your request to earn college credit.',
					'This process should take no more than two business days.',
					'If you believe there has been an error, please contact the',
					'<a class=\'link\' href=\'www.ou.edu\'>OU Admissions Office.</a>'
				].join(' '),
				cls: 'pending'
			},
			admission_reject: {
				title: 'Admission Denied',
				information: [
					'Your request to earn college credit has been denied',
					'If you believe there has been an error, please contact the',
					'<a class=\'link\' href=\'www.ou.edu\'>OU Admissions Office</a>',
					'or <a class=\'link\' href=\'resubmit\'>resubmit your application</a>.'
				].join(' '),
				cls: 'rejected'
			},
			credit_enrolled: {
				title: 'How do I drop the course?',
				information: 'Contact the <a class=\'link\' href=\'www.ou.edu\'>OU Admissions Office</a> by {date} for a full refund.',
				cls: 'enrolled'
			}
		}
	},


	getState: function(side, name, data) {
		var state = this.ENROLLMENT_STATES[side][name],
			prop, key;

		if (!state || !data) { return state; }

		for (prop in data) {
			if (data.hasOwnProperty(prop)) {
				key = '{' + prop + '}';
				state.information = state.information.replace(key, data[prop]);
				state.title = state.title.replace(key, data[prop]);
				if (state.warning) {
					state.warning = state.warning.replace(key, data[prop]);
				}
			}
		}

		return state;
	},


	updateEnrollmentCard: function() {
		this.cardsContainerEl.dom.innerHTML = '';

		var me = this;

		function finish(state) {
			me.state = state;
			me.enrollmentCardTpl.append(me.cardsContainerEl, state);
		}

		me.getEnrollmentData()
			.then(function(courseData) {
				var enrollcutoff = Ext.Date.format(courseData.EnrollCutOff, 'F j'),
					dropcutoff = Ext.Date.format(courseData.DropCutOff, 'F j'),
					start = Ext.Date.format(courseData.StartDate, 'F j'),
					now = new Date(),
					state = {
						top: {},
						bottom: {}
					};

				//if the course is archived
				if (courseData.EndDate < now) {
					//just hide the bottom part for now
					state.bottom.cls = 'openonly';
					//if not enrolled
					if (!courseData.Enrolled) {
						state.top = me.getState('top', 'archived_not_enrolled');
						state.buttonCls = 'open';
						state.buttonText = 'Add Archived Course';
					}

					if (courseData.EnrolledForCredit) {
						state.top = me.getState('top', 'archived_enrolled_for_credit');
						state.buttonCls = '';
						state.buttonText = '';
					}

					//if open enrolled before it was archived
					if (courseData.OpenEnrolled && courseData.EndDate > courseData.EnrollStartDate) {
						state.top = me.getState('top', 'archived_enrolled_before');
						state.buttonCls = 'drop';
						state.buttonText = 'Drop the Open Course';
					}

					//if open enrolled after it was archived
					if (courseData.OpenEnrolled && courseData.EndDate <= courseData.EnrollStartDate) {
						state.top = me.getState('top', 'archived_not_enrolled');
						state.buttonCls = 'drop';
						state.buttonText = 'Drop Archived Course';
					}

					//ignore these for now
					////if enrolled for credit pass
					//if (data.EnrolledFoCredit && data.passed) {

					//}

					////if enrolled for credit fail
					//if (data.EnrolledForCredit && !data.passed) {

					//}

					finish(state);
					return;
				}

				if (courseData.OpenEnrolled) {
					state.top = me.getState('top', 'open_enrolled', {
						date: start
					});
					state.buttonCls = 'drop';
					state.buttonText = 'Drop the Open Course';
				} else if (courseData.EnrolledForCredit) {
					state.top = me.getState('top', 'credit_enrolled', {
						date: start
					});

					state.buttonCls = '';
					state.buttontext = '';
				} else {
					state.top = me.getState('top' , 'not_enrolled');

					state.buttonCls = 'open';
					state.buttonText = 'Enroll in the Open Course';
				}

				if (courseData.AvailableForCredit) {
					if (courseData.EnrolledForCredit) {
						state.bottom = me.getState('bottom', 'credit_enrolled', {
							date: enrollcutoff
						});
					} else if (courseData.AdmissionState === 'Pending') {
						state.bottom = me.getState('bottom', 'admission_pending');
					} else if (courseData.AdmissionState === 'Rejected') {
						state.bottom = me.getState('bottom', 'admission_reject');
					} else {
						//TODO fill this out from the course
						state.bottom = me.getState('bottom', 'not_enrolled', {
							'#': courseData.Hours,
							'date': start
						});
						state.price = '$599';
					}
				} else {
					state.bottom.cls = 'openonly';
				}

				finish(state);
			});
	},


	showMessage: function(msg, isError) {
		var me = this,
			win = me.up('[showMsg]');

		win.showMsg(msg, isError, false, me.msgClickHandler)
			.then((me.msgClickHandler || Ext.emptyFn).bind(me))
			.fail(function() {
				delete me.msgClickHandler;
			});
	},


	handleEnrollmentClick: function(e) {
		var me = this,
			checkbox = e.getTarget('.bottom.checkbox'),
			button = this.cardsContainerEl.down('.button'),
			anchor = e.getTarget('a'), href;

		checkbox = Ext.get(checkbox);

		if (checkbox) {
			if (checkbox.hasCls('checked')) {
				button.update(this.state.buttonText);
				button.removeCls(['drop', 'credit', 'open']);
				button.addCls(this.state.buttonCls);
				checkbox.removeCls('checked');
			} else {
				button.update('Enroll For College Credit!');
				button.removeCls(['drop', 'open']);
				button.addCls('credit');
				checkbox.addCls('checked');
			}
		}

		if (anchor) {
			href = anchor.getAttribute('href');

			if (href === 'welcome') {
				e.stopEvent();
				me.fireEvent('show-permanent-welcome-guide', {
					link: $AppConfig.userObject.getLink('content.permanent_welcome_page')
				});

				return false;
			}

			if (href === 'profile') {
				e.stopEvent();
				me.fireEvent('show-profile', $AppConfig.userObject, ['about']);
				me.up('library-available-courses-window').close();
				return false;
			}

			if (href === 'resubmit') {
				e.stopEvent();
				me.fireEvent('enroll-for-credit', me.course);
				return false;
			}
		}

		function done(success, change) {
			delete me.changingEnrollment;
			if (success && change) {
				me.updateEnrollmentCard();
			}

			me.removeMask();
		}

		if (!e.getTarget('.button')) {
			return;
		}

		me.addMask();

		//if we are dropping
		if (button.hasCls('drop')) {
			var title = me.course.get('Title');//Ext.DomHelper.markup({tag: 'span', cls: 'course-title', html: me.course.get('Title')});
			this.changingEnrollment = true;

			Ext.Msg.show({
				msg: 'Dropping ' + title + ' will remove it from your library, and you will no longer have access to the course materials.',
				buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				scope: this,
				icon: 'warning-red',
				buttonText: {'ok': 'caution:Drop Course'},
				title: 'Are you sure?',
				fn: function(str) {
					if (str === 'ok') {
						me.fireEvent('change-enrollment', me.course, false, function(success, change) {
							if (success) {
								me.fireEvent('enrolled-action', false);
								me.showMessage('You are no longer enrolled in ' + me.course.get('Title') + '.');
							} else {
								me.showMessage('There was an error dropping the course, please try again later.', true);
							}

							done(success, change);
						});
						return;
					}

					done(false);
				}
			});

			return;
		}

		if (button.hasCls('open')) {
			this.changingEnrollment = true;
				me.fireEvent('change-enrollment', me.course, true, function(success, change) {
					if (success) {
						me.fireEvent('enrolled-action', true);

						me.msgClickHandler = function() {
							CourseWareUtils.findCourseBy(me.course.findByMyCourseInstance())
								.then(function(course) {
									var instance = course.get('CourseInstance');

									instance.fireNavigationEvent(me);
								});
						};

						me.showMessage('You have successfully enrolled in ' + me.course.get('Title') + '. Click here to go to the content.');
					} else {
						me.showMessage('There was an error enrolling. Please try again later.', true);
					}

					done(success, change);
				});
				return;
		}


		if (button.hasCls('credit')) {
			me.fireEvent('enroll-for-credit', me.course);
		}

		done();
	}
});

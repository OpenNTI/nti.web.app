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
				{cls: 'seats', html: ''},
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

		AnalyticsUtil.getResourceTimer(this.course.getId(), {
			type: 'course-catalog-viewed',
			course: this.course.getId()
		});

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


	stopClose: function() {
		return this.changingEnrollment ? Promise.reject() : Promise.resolve();
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.buildVideo();

		me.updateEnrollmentCard();

		me.mon(me.cardsEl, 'click', 'handleEnrollmentClick', me);
	},


	onDestroy: function() {
		this.callParent(arguments);

		AnalyticsUtil.stopResourceTimer(this.course.getId(), 'course-catalog-viewed');

		Ext.destroy(this.video);
	},


	onBeforeDeactivate: function() {
		return !this.changingEnrollment;
	},


	addMask: function() {
		try {
			var maskEl = this.el && this.el.up('.body-container');
			if (maskEl) {
				maskEl.mask('Loading...');
			}
		} catch (e) {
			console.warn('Error masking. %o', e);
		}
	},


	removeMask: function() {
		var maskEl = this.el.up('.body-container'),
			mask = maskEl && maskEl.down('.x-mask'),
			maskMsg = maskEl && maskEl.down('.x-mask-msg');

		if (mask) {
			mask.addCls('removing');
		}

		if (maskMsg) {
			maskMsg.addCls('removing');
		}

		if (maskEl) {
			wait(1000).then(maskEl.unmask.bind(maskEl));
		}
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
				floatParent: me,
				doNotCaptureAnalytics: true
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
		var c = this.course, catalogData, p;

		catalogData = {
			StartDate: c.get('StartDate'),
			EndDate: c.get('EndDate'),
			EnrollCutOff: c.get('EnrollForCreditCutOff'),
			DropCutOff: c.get('DropCutOff'),
			AvailableForCredit: c.get('NTI_FiveminuteEnrollmentCapable'),
			Enrolled: c.isActive(),
			OpenEnrolled: c.isActive() && !c.isEnrolledForCredit(),
			EnrolledForCredit: c.isEnrolledForCredit(),
			AdmissionState: $AppConfig.userObject.get('admission_status'),
			Price: '$' + c.get('OU_Price')
		};

		catalogData.enrollcutoff = Ext.Date.format(catalogData.EnrollCutOff, 'F j, g:i A T');
		catalogData.dropcutoff = Ext.Date.format(catalogData.DropCutOff, 'F j, g:i A T');
		catalogData.start = Ext.Date.format(catalogData.StartDate, 'F j, g:i A T');

		if (catalogData.Enrolled) {
			p = CourseWareUtils.findCourseBy(c.findByMyCourseInstance())
				.then(function(instance) {
					if (instance) {
						catalogData.EnrollStartDate = instance.get('CreatedTime');
					}
				})
				.fail(function(reason) {
					console.error('Failed to find course instance: ', reason);
				});
		} else {
			p = Promise.resolve();
		}

		return p.then(function() {
			return catalogData;
		});
	},


	getCourseDetailsData: function() {
		var detailsLink = this.course.getLink('fmaep.course.details'),
			details, p;

		details = {
			AvailableForCredit: true,
			AvailableSeats: 0,
			API_DOWN: false
		};

		if (detailsLink) {
			p = Service.request(detailsLink)
				.then(function(json) {
					json = Ext.decode(json, true);

					if (json) {
						if (json.Status === 422) {
							details.AvailableForCredit = false;
						} else {
							details.AvailableSeats = json.Course.SeatAvailable;
						}
					}
				})
				.fail(function(reason) {
					console.error('Course detail request failed: ', reason);

					details.API_DOWN = true;
				});
		} else {
			p = Promise.resolve();
		}

		return p.then(function() {
			return details;
		});
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
				warning: 'Not available after {date}.',
				cls: 'checkbox'
			},
			api_down: {
				title: 'Earn College Credit',
				information: [
					'Transcripted credit is available from the University of Oklahoma but unfortunately we cannot process an application at this time.',
					'Please contact the <a class=\'link\'href=\'mailto:support@nextthought.com\'>help desk.</a>'
				].join(' '),
				cls: 'rejected'
			},
			admission_pending: {
				title: 'Admission Pending...',
				information: [
					'We\'re processing your request to earn college credit.',
					'This process should take no more than two business days.',
					'If you believe there has been an error, please contact',
					'<a class=\'link\' href=\'mailto:pending@ou.edu\'>pending@ou.edu</a>.'
				].join(' '),
				cls: 'pending'
			},
			admission_reject: {
				title: 'We are unable to confirm your eligibility to enroll through this process.',
				information: [
					'Please contact',
					'<a class=\'link\' href=\'http://www.ou.edu/admissions.html\' target=\'_blank\'>OU Admissions Office</a>',
					'or <a class=\'link\' href=\'resubmit\'>resubmit your application</a>.'
				].join(' '),
				cls: 'rejected'
			},
			credit_enrolled: {
				title: 'How do I drop the course?',
				information: [
					'If you are currently enrolled as an OU student, visit',
					'<a class=\'link\' target=\'_blank\' href=\'http://ozone.ou.edu\'>oZone</a>.',
					'If not, please contact the',
					'<a class=\'link\' target=\'_blank\' href=\'http://www.ou.edu/admissions.html\'>Admission office</a>',
					'by {date} for a full refund.'
				].join(' '),
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


	buildEnrollmentCard: function(state) {
		if (Ext.isArray(state)) {
			state = state[0];
		}

		this.state = state;
		this.cardsContainerEl.removeCls('loading');
		this.enrollmentCardTpl.append(this.cardsContainerEl, state);
		this.cardsContainerEl.el.unmask();
	},


	applyToEnrollmentCard: function(state) {
		var bottom = this.cardsContainerEl.el.down('.bottom');

		if (state.bottom) {
			if (state.bottom.cls) {
				bottom.addCls(state.bottom.cls);
			}

			if (state.bottom.title) {
				bottom.down('.title').update(state.bottom.title);
			}

			if (state.bottom.information) {
				bottom.down('.info').update(state.bottom.information);
			}

			if (state.bottom.warning) {
				bottom.down('.warning').update(state.bottom.warning);
			}

			if (state.price) {
				bottom.down('.price').update(state.price);
			}

			if (state.hasSeats) {
				if (state.seats === 0) {
					bottom.addCls('full');
					bottom.down('.warning').update('');
				} else if (state.seats <= 10) {
					bottom.down('.seats').update('Only ' + Ext.util.Format.plural(state.seats, 'seat') + ' left.');
				}
			}
		}

		bottom.removeCls('loading');
		bottom.el.unmask();
	},


	__setArchivedState: function(state, courseData) {
		var now = new Date();

		if (courseData.EndDate < now) {
			//just hide the bottom part for now
			state.bottom.cls = 'openonly';
			//if not enrolled
			if (!courseData.Enrolled) {
				state.top = this.getState('top', 'archived_not_enrolled');
				state.buttonCls = 'open';
				state.buttonText = 'Add Archived Course';
			}

			if (courseData.EnrolledForCredit) {
				state.top = this.getState('top', 'archived_enrolled_for_credit');
				state.buttonCls = '';
				state.buttonText = '';
			}

			//if open enrolled before it was archived
			if (courseData.OpenEnrolled && courseData.EndDate > courseData.EnrollStartDate) {
				state.top = this.getState('top', 'archived_enrolled_before');
				state.buttonCls = 'drop';
				state.buttonText = 'Drop the Open Course';
			}

			//if open enrolled after it was archived
			if (courseData.OpenEnrolled && courseData.EndDate <= courseData.EnrollStartDate) {
				state.top = this.getState('top', 'archived_not_enrolled');
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

			return Promise.reject(state);
		}

		return Promise.resolve([state, courseData]);
	},


	__setEnrolledState: function(result) {
		var state = result[0],
			courseData = result[1];

		if (courseData.OpenEnrolled) {
			state.top = this.getState('top', 'open_enrolled', {
				date: courseData.start
			});

			state.buttonCls = 'drop';
			state.buttonText = 'Drop the Open Course';
		} else if (courseData.EnrolledForCredit) {
			state.top = this.getState('top' , 'credit_enrolled', {
				date: courseData.start
			});

			state.buttonCls = '';
			state.buttonText = '';
		} else {
			state.top = this.getState('top', 'not_enrolled');

			state.buttonCls = 'open';
			state.buttonText = 'Enroll in the Open Course';
		}

		return Promise.resolve([state, courseData]);
	},


	__setAdmissionState: function(result) {
		var waitOnDetails = false,
			state = result[0],
			courseData = result[1];

		if (courseData.AvailableForCredit) {
			if (courseData.EnrolledForCredit) {
				state.bottom = this.getState('bottom', 'credit_enrolled', {
					date: courseData.dropcutoff
				});
			} else if (courseData.AdmissionState === 'Pending') {
				state.bottom = this.getState('bottom', 'admission_pending');
			} else if (courseData.AdmissionState === 'Rejected') {
				waitOnDetails = true;
			} else {
				//not enrolled and available for credit
				waitOnDetails = true;
			}
		} else if (courseData.EnrolledForCredit) {
			state.bottom = this.getState('bottom', 'credit_enrolled', {
				date: courseData.dropcutoff
			});
		} else {
			state.bottom.cls = 'openonly';
		}

		return waitOnDetails ? Promise.resolve([state, courseData]) : Promise.reject(state);
	},


	__setDetailsState: function(result, details) {
		var state = result[0],
			courseData = result[1];

		if (details.AvailableForCredit) {
			if (details.API_DOWN) {
				state.bottom = this.getState('bottom', 'api_down', {
					date: courseData.enrollcutoff
				});

				state.price = courseData.Price;
			} else if (courseData.AdmissionState === 'Rejected') {
				state.bottom = this.getState('bottom', 'admission_reject');
			} else {
				state.bottom = this.getState('bottom', 'not_enrolled', {
					date: courseData.enrollcutoff
				});
				state.price = courseData.Price;

				if (details.AvailableSeats !== undefined) {
					state.hasSeats = true;
					state.seats = details.AvailableSeats;

					if (details.AvailableSeats === 0) {
						state.bottom.cls = state.bottom.cls + ' full';
						state.bottom.warning = '';
					}
				}
			}
		}

		return Promise.reject(state);
	},


	updateEnrollmentCard: function() {
		if (this.isDestroyed) {
			return;
		}

		this.cardsContainerEl.dom.innerHTML = '';

		var me = this,
			state = {
				top: {},
				bottom: {}
			};

		me.cardsContainerEl.addCls('loading');
		me.cardsContainerEl.el.mask('Loading');

		//if the __set*State retunrs a rejected promise it means to go ahead and build the
		//component without going through the rest of the __set*State
		me.getEnrollmentData()
			.then(me.__setArchivedState.bind(me, state))
			.then(me.__setEnrolledState.bind(me))
			.then(me.__setAdmissionState.bind(me))
			.then(function(result) {
				var bottom,
					state = result[0];

				me.buildEnrollmentCard(state);

				bottom = me.cardsContainerEl.el.down('.bottom');

				if (!bottom) {
					console.error('No admission state part of the enrollment card');
					return;
				}

				bottom.addCls('loading');
				bottom.el.mask('Loading...');

				me.getCourseDetailsData()
					.then(me.__setDetailsState.bind(me, result))
					.fail(me.applyToEnrollmentCard.bind(me));

				//reject with no reason to break the chain
				return Promise.reject();
			})
			.fail(function(reason) {
				if (Ext.isObject(reason)) {
					return reason;
				}

				return Promise.reject(reason);
			})
			.then(me.buildEnrollmentCard.bind(me));
	},


	showMessage: function(msg, isError, cursor) {
		var me = this,
			win = me.up('[showMsg]'),
			guid = guidGenerator();

		if (!win) {return;}//user closed window before we got here.

		win.showMsg(msg, isError, false, guid, cursor);

		Ext.destroy(me.__showMessageClickMonitor);
		me.__showMessageClickMonitor = me.mon(win, {
			destroyable: true,
			single: true,
			'message-clicked': function(msgId) {
				if (msgId === guid) {
					Ext.callback(me.msgClickHandler);
				}
			}});
	},


	handleEnrollmentClick: function(e) {
		var me = this, win = me.up('window'),
			checkbox = e.getTarget('.bottom.checkbox'),
			button = this.cardsContainerEl.down('.button'),
			anchor = e.getTarget('a'), href, title;

		checkbox = Ext.get(checkbox);

		if (checkbox && !checkbox.hasCls('full')) {
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

				if (win) {
					win.close();
				}

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

			var store = Ext.getStore('courseware.AvailableCourses'),
				c = store.getById(me.course.getId());

			if (success && change) {
				if (c) {
					me.course = c;
				}

				me.updateEnrollmentCard();
			}

			me.removeMask();
		}

		if (!e.getTarget('.button')) {
			return;
		}

		me.addMask();

		title = me.course.get('Title');

		if (title.length >= 50) {
			title = title.substr(0, 47) + '...';
		} else {
			title = title + '.';
		}

		//if we are dropping
		if (button.hasCls('drop')) {
			this.changingEnrollment = true;

			Ext.Msg.show({
				msg: 'Dropping ' + me.course.get('Title') + ' will remove it from your library, and you will no longer have access to the course materials.',
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
								me.showMessage('You are no longer enrolled in ' + title);
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

									if (win) {
										win.close();
									}
								})
								.fail(function(reason) {
									alert('Unable to find course.');
									console.error('Unable to find course. %o', reason);
								});
						};

						me.showMessage('You have successfully enrolled in ' + title + ' Click here to go to the content.', null, true);
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

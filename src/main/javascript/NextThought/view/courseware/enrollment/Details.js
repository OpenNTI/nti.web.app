Ext.define('NextThought.view.courseware.enrollment.Details', {
	extend: 'Ext.Component',
	alias: 'widget.course-enrollment-details',

	cls: 'course-details',

	enrollmentCardTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'enroll-card {cardCls}', cn: [
			{cls: 'title', cn: '{title}'},
			{tag: 'h2', cls: 'main', html: '{main}'},
			{tag: 'p', cls: 'sub', html: '{description}'},
			{tag: 'tpl', 'if': 'warning', cn: [
				{cls: 'warning', html: '{warning}'}
			]},
			{tag: 'tpl', 'if': 'button', cn: [
				{cls: 'button', html: '{button}'}
			]}
		]}
	])),


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
		{cls: 'right enrollment-container'}
	]),


	renderSelectors: {
		videoEl: '.video',
		curtainEl: '.curtain',
		cardsEl: '.enrollment-container'
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

		me.addEnrollmentCards();

		me.mon(me.cardsEl, 'click', 'handleEnrollmentClick', me);
	},


	onBeforeDeactivate: function() {
		return !this.changingEnrollment;
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


	addEnrollmentCards: function() {
		this.cardsEl.dom.innerHTML = '';

		var openEnrolled, openEnroll, creditEnrolled, creditEnroll;

		openEnrolled = {
			cardCls: 'open-enrolled',
			title: 'register for the open course',
			main: 'Open courses are free to anyone, anywhere',
			description: 'Get complete access to interact with all course content, including lectures, course materials, quizes, and discussions once class is in session.',
			button: 'Drop Open Course'
		};

		openEnroll = {
			cardCls: 'open-enroll',
			title: 'register for the open course',
			main: 'Open courses are free to anyone, anywhere',
			description: 'Get complete access to interact with all course content, including lectures, course materials, quizes, and discussions once class is in session.',
			button: 'Register for the Open Course'
		};

		creditEnrolled = {
			cardCls: 'credit-enrolled',
			title: 'enrolled for credit',
			main: 'Open courses are free to anyone, anywhere',
			description: 'Contact OU to drop this course'
		};

		creditEnroll = {
			cardCls: 'credit-enroll',
			title: 'enroll for credit',
			main: 'Get college credit for taking this course.',
			description: 'Our 5 minute enrollment process is the fastest way to start earning college credit.',
			button: 'Enroll for Credit'
		};

		//TODO: Show a enrollment card for admin users?
		if (this.course.get('isAdmin')) {
			return;
		}


		//if we are enrolled for credit only show the credit enrolled option
		if (!this.course.enrolledForCredit) {
			//if we are open enrolled show the open enrolled option
			if (this.course.isActive()) {
				this.enrollmentCardTpl.append(this.cardsEl, openEnrolled);
			} else {
				//if we are not open enrolled show the option to open enroll
				this.enrollmentCardTpl.append(this.cardsEl, openEnroll);
			}

			//if the course is available for credit show the option to enroll for credit
			if (this.course.isAvailableForCredit) {
				this.enrollmentCardTpl.append(this.cardsEl, creditEnroll);
			}
		} else {
			this.enrollmentCardTpl.append(this.cardsEl, creditEnrolled);
		}
	},


	showMessage: function(msg, isError) {
		var me = this,
			win = me.up('[showMsg]');

		win.showMsg(msg, isError, me.msgClickHandler)
			.then((me.msgClickHandler || Ext.emptyFn).bind(me))
			.fail(function() {
				delete me.msgClickHandler;
			});
	},


	handleEnrollmentClick: function(e) {
		if (!e.getTarget('.button')) { return; }

		var me = this;

		me.el.mask('Loading...');

		function done(success, change) {
			delete this.changingEnrollment;
			if (success && change) {
				me.addEnrollmentCards();
			}

			me.el.unmask();
		}

		if (e.getTarget('.open-enrolled')) {
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
								me.showMessage('You are no longer enrolled in ' + me.course.get('Title'));
							} else {
								ms.showMessage('There was an error dropping the course, please try again later.', true);
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

		if (e.getTarget('.open-enroll')) {
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

					me.showMessage('You have successfully enrolled in ' + me.course.get('Title') + ' click here to go to the content.');
				} else {
					me.showMessage('There was an error enrolling, please try again later.', true);
				}

				done(success, change);
			});
			return;
		}
	}
});

var Ext = require('extjs');
var TimeUtils = require('../../../../util/Time');
var NavigationBase = require('../Base');
var UtilTime = require('../../../../util/Time');
var AssessmentAssignmentStatus = require('../../../course/assessment/AssignmentStatus');
var AccountActions = require('../../../account/Actions');
const {ControlBar} = require('nti-assignment-editor');
const ReactHarness = require('legacy/overrides/ReactHarness');
const { encodeForURI } = require('nti-lib-ntiids');


module.exports = exports = Ext.define('NextThought.app.contentviewer.navigation.assignment.Student', {
	extend: 'NextThought.app.contentviewer.navigation.Base',
	alias: 'widget.assignment-header',
	WARNING_PERCENT: 0.2,
	RED_PERCENT: 0.1,
	cls: 'student-reader-header reader-header course-assessment-header assignment-item',

	toolbarTpl: Ext.DomHelper.markup([
		'{super}',
		{
			cls: 'time-remaining hidden',
			cn: [
				{cls: 'time', cn: [
					{cls: 'loading-bar'},
					{cls: 'meta', cn: [
						{tag: 'span', cls: 'label', html: 'Time Expired'},
						{tag: 'span', cls: 'time-left'}
					]}
				]},
				{cls: 'help', html: 'Report a Problem'},
				{cls: 'submit', cn: [
					{cls: 'unanswered'},
					{cls: 'submit-btn', html: 'I\'m Finished!'}
				]},
				{cls: 'control-bar-container'}
			]
		}
	]),

	headerTpl: Ext.DomHelper.markup([
		{cls: 'quiz-container ontime', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'turned-in'}
		]},
		{cls: 'grade-container', cn: [
			{cls: 'title', html: '{{{NextThought.view.courseware.assessment.reader.Header.grade}}}'},
			{cls: 'grade'}
		]}
	]),

	renderSelectors: {
		ontimeIconEl: '.quiz-container .ontime-icon',
		turnedInEl: '.quiz-container .turned-in',
		gradeContainerEl: '.grade-container',
		gradeEl: '.grade-container .grade',
		timeContainerEl: '.time-remaining',
		loadingBarEl: '.time-remaining .time .loading-bar',
		timeLabelEl: '.time-remaining .time .meta span.label',
		timeMetaEl: '.time-remaining .time .meta',
		timeEl: '.time-remaining .time .meta span.time-left',
		helpEl: '.time-remaining .help',
		submitEl: '.time-remaining .submit',
		unansweredEl: '.time-remaining .submit .unanswered',
		submitBtnEl: '.time-remaining .submit .submit-btn',
		controlBarEl: '.control-bar-container'
	},

	beforeRender: function () {
		this.callParent(arguments);

		var rd = {};

		this.AccountActions = NextThought.app.account.Actions.create();

		if (this.assignmentHistory) {
			rd.title = this.assignment.get('title');

			if (this.assignmentHistory instanceof Promise) {
				this.assignmentHistory.then(this.setHistory.bind(this));
			} else {
				this.setHistory(this.assignmentHistory);
			}
		} else {
			this.setHistory(this.assignmentHistory);
		}

		this.renderData = Ext.apply(this.renderData || {}, rd);
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this,
			panel = me.up('reader');

		if (panel) {
			panel.el.appendChild(me.timeContainerEl);

			me.alignTimer();

			Ext.EventManager.onWindowResize(me.alignTimer, me, false);

			me.on('destroy', function () {
				Ext.EventManager.removeResizeListener(me.alignTimer, me);
				if (me.timer) {
					me.timer.stop();
				}
			});

			me.on('destroy', me.timeContainerEl.destroy.bind(me.timeContainerEl));
		}

		me.mon(me.submitBtnEl, 'click', 'submitAssignmentClicked');
		me.mon(me.helpEl, 'click', 'helpClicked');

		this.maybeMountControlBar();
	},


	getControlBarConfig () {
		const routePart = encodeForURI(this.assignment.getId());

		return {
			component: ControlBar,
			assignment: this.assignment,
			doEdit: () => {
				this.doNavigation('', `${routePart}/edit`, {assignment: this.assignment});
			},
			renderTo: this.controlBarEl
		};
	},


	maybeMountControlBar () {
		if (!this.rendered) { return; }

		if (this.assignment.canEdit()) {
			this.ControlBar = new ReactHarness(this.getControlBarConfig());

			this.on('destroy', () => this.ControlBar.destroy());
		}

	},


	alignTimer: function () {
		if (!this.rendered) {
			return;
		}

		var rect = this.el.dom.getBoundingClientRect();

		this.timeContainerEl.setStyle({
			left: rect.left + rect.width + 'px'
		});
	},

	helpClicked: function () {
		this.AccountActions.showContactUs();
	},

	hideTimer: function () {
		this.timeContainerEl.addCls('hidden');

		if (this.timer) {
			this.timer.stop();
		}
	},

	showAllowedTime: function (time) {
		if (!this.rendered) {
			this.on('afterrender', this.showAllowedTime.bind(this, time));
			return;
		}

		var t = TimeUtils.getNaturalDuration(time, 2);

		this.timeContainerEl.removeCls('hidden');
		this.timeContainerEl.addCls('max-time');
		this.timeEl.update(t);
	},

	showRemainingTime: function (time, max, getSubmitFn) {
		if (!this.rendered) {
			this.on('afterrender', this.showRemainingTime.bind(this, time, max, getSubmitFn));
			return;
		}

		if (time < 0) {
			wait()
				.then(this.showOverdueTime.bind(this, -1 * time, max));
		} else {
			wait()
				.then(this.showDueTime.bind(this, time, max, getSubmitFn));
		}

		this.timeContainerEl.removeCls(['hidden', 'max-time']);
	},

	showOverdueTime: function (time) {
		var me = this,
			current;

		me.timer = TimeUtils.getTimer();

		me.loadingBarEl.setWidth('100%');

		me.timer
			//add 3 seconds since the overdue animation is 3 seconds long
			.countUp(null, time + 3000)
			.tick(function (t) {
				var s = NextThought.app.course.assessment.AssignmentStatus.getTimeString(t);

				if (s && s !== current) {
					current = s;
					me.timeEl.update(s + ' Over');
				}

				me.timeMetaEl.dom.setAttribute('data-qtip', TimeUtils.getNaturalDuration(t.time) + ' over');
			});

		me.timeContainerEl.removeCls('warning-orange');
		me.timeContainerEl.addCls(['over-time', 'recent', 'warning-red']);
		me.timeLabelEl.update('Time Expired');

		wait(3034)
			.then(me.timeContainerEl.removeCls.bind(me.timeContainerEl, 'recent'))
			.then(me.timer.start.bind(me.timer, 'seconds'));
	},

	showDueTime: function (time, max, getSubmitFn) {
		var me = this,
			current,
			warning = max * me.WARNING_PERCENT,
			red = Math.min(max * me.RED_PERCENT, 30 * 1000); //10% or 30 Seconds

		me.timer = TimeUtils.getTimer();

		me.timer
			.countDown(0, time)
			.tick(function (t) {
				var s = NextThought.app.course.assessment.AssignmentStatus.getTimeString(t, true),
					//since we are counting down the remaining will be the max starting out
					//so 100 - %remaining of max will give the % of time left
					percentDone = 100 - ((t.remaining / max) * 100);

				if (s && s !== current) {
					current = s;
					me.timeEl.update(s);
				}

				me.timeMetaEl.dom.setAttribute('data-qtip', TimeUtils.getNaturalDuration(t.remaining));

				me.loadingBarEl.setWidth(Math.floor(percentDone) + '%');

				if (t.remaining < red) {
					if (!me.timeContainerEl.hasCls('warning-red')) {
						me.timeContainerEl.addCls('warning-red');
						me.timeContainerEl.removeCls('warning-orange');
						me.showSubmitToast(getSubmitFn);
					}
				} else if (t.remaining <= warning) {
					me.timeContainerEl.addCls('warning-orange');
				}
			})
			.alarm(function () {
				me.timer.stop();
				me.showOverdueTime(0);
			})
			.start('seconds');
	},

	showSubmitToast: function (getSubmitFn) {
		if (!getSubmitFn) { return; }

		var submitState = getSubmitFn(this.updateSubmitState.bind(this));

		this.updateSubmitState(submitState);
	},

	updateSubmitState: function (submitState) {
		this.submitFn = submitState.submitFn;

		this.timeContainerEl.addCls('submit-showing');

		if (submitState.enabled) {
			this.submitBtnEl.removeCls('disabled');
		} else {
			this.submitBtnEl.addCls('disabled');
		}

		if (submitState.unanswered === 0) {
			this.unansweredEl.addCls('good');
			this.unansweredEl.update('All questions answered.');
		} else {
			this.unansweredEl.removeCls('good');
			this.unansweredEl.update(Ext.util.Format.plural(submitState.unanswered, 'question') + ' unanswered.');
		}
	},

	submitAssignmentClicked: function (e) {
		if (!e.getTarget('.disabled') && this.submitFn) {
			this.submitFn.call(null);
		}
	},

	setHistory: function (history) {
		if (!this.rendered) {
			this.on('afterrender', this.setHistory.bind(this, history));
			return;
		}

		var grade = history && history.get('Grade'),
			due = this.assignment && this.assignment.getDueDate(),
			historyDuration = history && history.getDuration() || {},
			submission = history && history.get('Submission'),
			parts = this.assignment.get('parts'),
			hasParts = parts && parts.length > 0,
			completed = submission && submission.get('CreatedTime'),
			overdue, isNoSubmit = this.assignment.isNoSubmit();

		if (((!history || !submission) && hasParts) || (this.assignment.isTimed && !this.assignment.isStarted())) {
			this.removeCls('submitted');
			this.updateLayout();
			return;
		} else {
			this.addCls('submitted');
		}

		if (isNoSubmit === true) {
			this.addCls('nosubmit');
		}

		if (!this.rendered) { return; }

		this.turnedInEl.update(NextThought.app.course.assessment.AssignmentStatus.getStatusHTML({
			due: this.assignment.getDueDate(),
			maxTime: this.assignment.isTimed && this.assignment.getMaxTime(),
			duration: this.assignment.isTimed && (this.assignment.getDuration() || historyDuration),
			isNoSubmitAssignment: this.assignment.isNoSubmit(),
			completed: completed,
			isExcused: grade && grade.get('IsExcused')
		}));

		//we don't want to show the remaining time if we have a submission
		this.showRemainingTime = function () {};

		if (this.timer) {
			this.timer.stop();
		}

		if (this.hideTimer) {
			this.hideTimer();
		}

		grade = grade && grade.getValues();

		if (grade) {
			this.gradeEl.update(grade.value);
			this.gradeContainerEl.show();
		} else {
			this.gradeContainerEl.hide();
		}

		this.updateLayout();
	}
});

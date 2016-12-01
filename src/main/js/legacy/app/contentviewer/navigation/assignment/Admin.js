var Ext = require('extjs');
var ParseUtils = require('../../../../util/Parsing');
var TimeUtils = require('../../../../util/Time');
var NavigationBase = require('../Base');
var MixinsProfileLinks = require('../../../../mixins/ProfileLinks');
var MixinsChatLinks = require('../../../../mixins/ChatLinks');
var AssessmentAssignmentStatus = require('../../../course/assessment/AssignmentStatus');
var ChatStateStore = require('../../../chat/StateStore');
var {isFeature} = require('legacy/util/Globals');

const {ControlBar} = require('nti-assignment-editor');
const ReactHarness = require('legacy/overrides/ReactHarness');
const { encodeForURI } = require('nti-lib-ntiids');


module.exports = exports = Ext.define('NextThought.app.contentviewer.navigation.assignment.Admin', {
	extend: 'NextThought.app.contentviewer.navigation.Base',
	alias: 'widget.course-assessment-admin-reader-header',
	ui: 'course-assessment',
	cls: 'admin-reader-header reader-header course-assessment-header assignment-item',

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks',
		enableChat: 'NextThought.mixins.ChatLinks'
	},

	headerTpl: Ext.DomHelper.markup([
		{cls: 'predicted hidden', cn: [
			{cls: 'label', 'data-qtip': 'Estimated from the grading policy in the Syllabus', html: 'Projected Grade'},
			{cls: 'value', html: '{predicted}'}
		]},
		{ cls: 'grade', cn: [
			{ cls: 'label', html: '{gradeTitle} {{{NextThought.view.courseware.assessment.admin.Header.grade}}}'},
			{ cls: 'gradebox', cn: [
				{ tag: 'input', size: 3, type: 'text', value: '{grade}'},
				{ tag: 'tpl', 'if': 'totalPoints', cn: [
					{tag: 'span', 'cls': 'total-points', html: '/ {totalPoints}'}
				]},
				{ cls: 'dropdown letter grade', html: '{letter}'}
			]}
		]},
		{cls: 'assignment-actions disabled'},
		{cls: 'status', cn: [
			{cls: 'status-item', cn: {tag: 'span', cls: 'completed'}},
			{cls: 'status-item', cn: {tag: 'span', cls: 'timed'}},
			{cls: 'status-item', cn: {tag: 'span', cls: 'excused {excused.cls}', html: '{excused.html}'}}
		]},
		{ cls: 'user', cn: [
			'{creator:avatar}',
			{ cls: 'wrap', cn: [
				{ cls: 'title name {presence}', cn: {html: '{displayName}' }},
				{ cls: 'username', cn: {html: '({Username})'}},
				{ cls: 'subtitle actions', cn: [
					{ tag: 'span', cls: 'profile link', html: '{{{NextThought.view.courseware.assessment.admin.Header.profile}}}'},
					{ tag: 'span', cls: 'email link', html: '{{{NextThought.view.courseware.assessment.admin.Header.email}}}'},
					{ tag: 'span', cls: 'chat link', html: '{{{NextThought.view.courseware.assessment.admin.Header.chat}}}'}
				]}
			]}
		]},
		{cls: 'control-bar-container'}
	]),

	renderSelectors: {
		nameEl: '.header .user .wrap .name',
		usernameEl: '.header .user .wrap .username',
		profileEl: '.header .user .wrap .actions .profile',
		emailEl: '.header .user .wrap .actions .email',
		chatEl: '.header .user .wrap .actions .chat',
		letterEl: '.header .grade .gradebox .letter',
		gradeEl: '.header .grade .gradebox input',
		completedEl: '.header .status .completed',
		timedEl: '.header .status .timed',
		gradeBoxEl: '.header .grade',
		predictedContainerEl: '.header .predicted',
		predictedEl: '.header .predicted .value',
		actionsEl: '.header .assignment-actions',
		excusedEl: '.header .status .excused',
		controlBarEl: '.control-bar-container'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.WindowActions = NextThought.app.windows.Actions.create();
	},

	beforeRender: function () {
		this.callParent(arguments);

		var status = this.status || 'Open',
			Username = this.student.get('OU4x4') || this.student.get('Username');

		this.currentGrade = '';
		this.currentLetter = '-';

		this.showingUsername = status !== 'Open';

		this.renderData = Ext.apply(this.renderData || {}, {
			displayName: this.student.toString(),
			Username: this.showingUsername ? Username : '',
			gradeTitle: this.gradeTitle || getString('NextThought.view.courseware.assessment.admin.Header.assignment'),
			creator: this.student,
			presence: this.student.getPresence().getName(),
			excused: this.__getExcusedTpl(),
			totalPoints: this.assignment && this.assignment.get('total_points')
		});

		this.createGradeMenu();

		this.on({
			emailEl: {click: 'openEmail'},
			letterEl: {click: 'showGradeMenu'},
			gradeEl: {blur: 'gradeChanged', keypress: 'maybeChangeGrade'},
			actionsEl: {click: 'showActionsMenu'}
		});
	},

	__getExcusedTpl: function () {
		var excusedTpl = {cls: 'off', html: 'Excused'},
			grade = this.assignmentHistory && this.assignmentHistory.get && this.assignmentHistory.get('Grade');

		if (grade && grade.get('IsExcused')) {
			excusedTpl.cls = 'on';
		}

		return excusedTpl;
	},

	afterRender: function () {
		var me = this;

		me.callParent(arguments);

		Object.keys(this.renderSelectors).forEach(function (s) {
			if (me[s]) {
				me[s].setVisibilityMode(Ext.Element.DISPLAY);
			}
		});

		if (this.assignmentHistory && this.assignmentHistory instanceof Promise) {
			this.assignmentHistory.then(this.setUpGradeBox.bind(this));
		} else {
			this.setUpGradeBox();
		}

		//for profile link
		me.user = me.student;
		me.enableProfileClicks(me.profileEl);

		if (me.showingUsername) {
			me.usernameEl.update('(' + me.user.getId() + ')');
			me.usernameEl.show();
		}

		me.emailEl.hide();
		me.setupEmail();
		me.maybeShowChat(me.chatEl);

		this.mon(this.ChatStore, 'presence-changed', function (username, presence) {
			if (username === me.user.getId()) {
				me.nameEl.removeCls('dnd away available unavailable');
				me.nameEl.addCls(presence.getName());
				me.maybeShowChat(me.chatEl);
			}
		});

		if (!this.showingUsername) {
			this.usernameEl.hide();
		}

		this.maybeMountControlBar();
	},


	getControlBarConfig () {
		const routePart = encodeForURI(this.assignment.getId());

		return {
			component: ControlBar,
			assignment: this.assignment,
			student: {
				displayName: this.student.getName()
			},
			doEdit: () => {
				this.doNavigation('', `${routePart}/edit`, {assignment: this.assignment});
			},
			renderTo: this.controlBarEl
		};
	},


	maybeMountControlBar () {
		if (!this.rendered) { return; }

		if (this.assignment && this.assignment.canEdit()) {
			this.ControlBar = new ReactHarness(this.getControlBarConfig());

			this.on('destroy', () => this.ControlBar.destroy());
		}

	},

	setupEmail: function () {
		var me = this;
		this.getStudentEnrollment(this.student)
			.then(function (enrollment) {
				var emailLink = enrollment && enrollment.getLink('Mail');
				if (emailLink) {
					me.emailEl.show();
				}

				me.studentEnrollment = enrollment;
			});
	},

	getStudentEnrollment: function (studentRecord) {
		var roster = this.currentBundle && this.currentBundle.getLink('CourseEnrollmentRoster'),
			username = studentRecord && studentRecord.get('Username'),
			smallRequestURLToGetCounts = roster && !Ext.isEmpty(roster) && Ext.String.urlAppend(
					roster,
					Ext.Object.toQueryString({
						batchSize: 1,
						batchStart: 0,
						usernameSearchTerm: username
					}));

		if (!isFeature('instructor-email') || !username) { return Promise.reject(); }

		return Service.request(smallRequestURLToGetCounts)
					.then(JSON.parse)
					.then(function (obj) {
						var enrollment = obj.Items && obj.Items[0];
						return Promise.resolve(ParseUtils.parseItems(enrollment)[0]);
					});
	},

	setUpGradeBox: function (historyItem) {
		if (!this.assignmentHistory && !historyItem) { return; }

		if (historyItem) {
			this.assignmentHistory = historyItem;
		}

		var grade = this.assignmentHistory.get('Grade'),
			values = grade && grade.getValues(),
			number = values && values.value,
			letter = values && values.letter,
			due = this.assignment.getDueDate(),
			isNoSubmitAssignment = this.assignmentHistory.isSyntheticSubmission(),
			submission = this.assignmentHistory.get('Submission'),
			completed = submission && submission.get('CreatedTime'),
			maxTime = this.assignment.isTimed && this.assignment.getMaxTime(),
			duration = this.assignment.isTimed && this.assignmentHistory.getDuration(),
			start = this.assignment.get('availableBeginning'),
			status = NextThought.app.course.assessment.AssignmentStatus.getRenderData({
				start,
				due,
				completed,
				maxTime,
				duration,
				isNoSubmitAssignment
			});

		this.letterEl.setStyle({display: 'none'});

		if (!grade) {
			console.warn('No grade not even a placeholder');
			this.gradeBoxEl.hide();
		}

		if (NextThought.app.course.assessment.AssignmentStatus.hasActions(this.assignmentHistory)) {
			this.actionsEl.removeCls('disabled');
		} else {
			this.actionsEl.addCls('disabled');
		}

		if (status.completed) {
			if (isNoSubmitAssignment) {
				this.completedEl.addCls('ontime');

				if (status.completed.date) {
					this.completedEl.dom.setAttribute('data-qtip', status.completed.date);
				}

				this.completedEl.update('Graded');
			} else if (status.overdue) {
				this.completedEl.addCls('late');

				if (status.overdue.qtip) {
					this.completedEl.dom.setAttribute('data-qtip', status.overdue.qtip);
				}

				this.completedEl.update(TimeUtils.getNaturalDuration(completed.getTime() - due.getTime(), 1) + ' late');
			} else {
				this.completedEl.addCls('ontime');

				if (status.completed.qtip) {
					this.completedEl.dom.setAttribute('data-qtip', status.completed.qtip);
				}

				this.completedEl.update('On Time');
			}

			if (status.maxTime) {
				if (status.overtime) {
					this.timedEl.addCls('late');
					this.timedEl.dom.setAttribute('data-qtip', status.overtime.qtip);
					this.timedEl.update(status.maxTime.html);
				} else {
					this.timedEl.addCls('ontime');
					this.timedEl.update(status.maxTime.html);
				}
			}

			this.markGradeAsExcused(grade);
		} else {
			this.completedEl.removeCls(['late', 'ontime']);
			if (status.due.qtip) {
				this.completedEl.dom.setAttribute('data-qtip', status.due.qtip);
			}
			this.completedEl.update(status.due.html);

			if (status.maxTime) {
				this.timedEl.removeCls(['late', 'ontime']);
				this.timedEl.update(status.maxTime.html);
			} else {
				this.timedEl.update('');
			}
		}

		if (number || number === '') {
			this.currentGrade = number;
			this.gradeEl.dom.value = number;
		}

		if (letter) {
			this.currentLetter = letter;
			//this.letterEl.update(letter);
		}
		this.mon(this.assignmentHistory, 'excused-changed', this.excuseGradeStatusChanged.bind(this));
		this.mon(this.assignmentHistory, 'reset-assignment', this.markAssignmentAsReset.bind(this));
	},

	showActionsMenu: function (e) {
		if (e.getTarget('.disabled') || !this.assignmentHistory) { return; }

		var me = this,
			menu = NextThought.app.course.assessment.AssignmentStatus.getActionsMenu(me.assignmentHistory);

		menu.showBy(me.actionsEl, 'tr-br');
	},

	changeGrade: function (number, letter) {
		var me = this,
			historyItem = this.assignmentHistory;

		if (!historyItem) {
			console.error('No assignmentHistory set, cannot change the grade');
			return;
		}

		historyItem.saveGrade(number, letter)
			.then(me.fireEvent.bind(me, 'grade-saved'))
			.catch(function (reason) {
				console.error('Failed to save Grade:', reason);
				Error.raiseForReport(reason);
			})
			.always(function () {
				me.setUpGradeBox();
			});
	},

	showGradeMenu: function () {
		if (this.letterEl.hasCls('disabled')) { return; }

		this.gradeMenu.showBy(this.letterEl, 'tl-tl', this.gradeMenu.offset);
	},

	createGradeMenu: function () {
		//Wasn't sure if this needs to be translated or not?
		var items = NextThought.model.courseware.Grade.Items;

		this.gradeMenu = Ext.widget('menu', {
			cls: 'letter-grade-menu',
			width: 60,
			minWidth: 60,
			ownerCmp: this,
			offset: [-1, -1],
			defaults: {
				ui: 'nt-menuitem',
				xtype: 'menucheckitem',
				group: 'gradeOptions',
				cls: 'letter-grade-option',
				height: 35,
				plain: true,
				listeners: {
					scope: this,
					'checkchange': 'changeLetterGrade'
				}
			},
			items: items
		});
	},

	changeLetterGrade: function (item, status) {
		if (!status) { return; }
		var offset = item.getOffsetsTo(this.gradeMenu),
			x = offset && offset[1];

		this.letterEl.update(item.text);

		this.gradeMenu.offset = [-1, -x];

		this.currentLetter = item.text;

		this.changeGrade(this.currentGrade, this.currentLetter);
	},

	maybeChangeGrade: function (e, el) {
		if (e.getCharCode() === e.ENTER) {
			this.gradeChanged(e, el);
		}
	},

	gradeChanged: function (e, el) {
		this.currentGrade = el.value;

		this.changeGrade(this.currentGrade, this.currentLetter);
	},

	excuseGradeStatusChanged: function () {
		var grade = this.assignmentHistory.get('Grade');

		if (!grade) { return; }

		this.markGradeAsExcused(grade);
	},

	markGradeAsExcused: function (grade) {
		if (!grade || !grade.isModel) { return; }

		var cls = grade.get('IsExcused') === true ? 'on' : 'off',
			rCls = grade.get('IsExcused') === true ? 'off' : 'on';
		this.excusedEl.removeCls(rCls);
		this.excusedEl.addCls(cls);
	},

	markAssignmentAsReset: function () {
		this.excusedEl.removeCls('on');
		this.excusedEl.addCls('off');
		this.setUpGradeBox();
	},

	openEmail: function (e) {
		var emailRecord = new NextThought.model.Email(),
			mailLink = this.studentEnrollment && this.studentEnrollment.getLink('Mail');

		if (!mailLink) { return; }

		emailRecord.set('url', this.studentEnrollment.getLink('Mail'));
		emailRecord.set('Receiver', this.student);

		this.WindowActions.showWindow('new-email', null, e.getTarget(), null, {
			record: emailRecord
		});
	}
});

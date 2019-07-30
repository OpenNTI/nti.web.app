const Ext = require('@nti/extjs');
const {ControlBar, NavigationBar} = require('@nti/web-assignment-editor');
const { encodeForURI } = require('@nti/lib-ntiids');
const {scoped} = require('@nti/lib-locale');

const ChatStateStore = require('legacy/app/chat/StateStore');
const AssignmentStatus = require('legacy/app/course/assessment/AssignmentStatus');
const WindowsActions = require('legacy/app/windows/Actions');
const Grade = require('legacy/model/courseware/Grade');
const Email = require('legacy/model/Email');
const ReactHarness = require('legacy/overrides/ReactHarness');
const {isFeature} = require('legacy/util/Globals');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
const TimeUtils = require('legacy/util/Time');

require('legacy/overrides/ReactHarness');
require('legacy/mixins/ProfileLinks');
require('legacy/mixins/ChatLinks');
require('../Base');

const t = scoped('nti-web-app.contentviewer.navigation.assignment.Admin', {
	gradeTitle: 'Assignment Grade'
});


module.exports = exports = Ext.define('NextThought.app.contentviewer.navigation.assignment.Admin', {
	extend: 'NextThought.app.contentviewer.navigation.Base',
	alias: 'widget.course-assessment-admin-reader-header',
	ui: 'course-assessment',
	cls: 'admin-reader-header reader-header course-assessment-header assignment-item',

	usePageSource: true,

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
			{ cls: 'label', html: '{gradeTitle}'},
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
				]},
				{ cls: 'attempt-switcher'}
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
		attemptSwitcherEL: '.header .user .attempt-switcher',
		controlBarEl: '.control-bar-container'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.ChatStore = ChatStateStore.getInstance();
		this.WindowActions = WindowsActions.create();
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
			gradeTitle: this.gradeTitle || t('gradeTitle'),
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
			grade = this.assignmentHistory && this.assignmentHistory.getMostRecentHistoryItemGrade && this.assignmentHistory.getMostRecentHistoryItemGrade();

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

		if (this.assignmentHistoryItemContainer && this.assignmentHistoryItemContainer instanceof Promise) {
			this.assignmentHistoryItemContainer.then(this.setupHistoryItemContainer.bind(this));
		} else {
			this.setupHistoryItemContainer(this.assignmentHistoryItemContainer);
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
				if (this.handleEdit) {
					this.handleEdit(this.assignment);
				} else {
					this.doNavigation('', `${routePart}/edit`, {assignment: this.assignment});
				}

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


	maybeAddControlbarForPageInfo () {},


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
				return Promise.resolve(lazy.ParseUtils.parseItems(enrollment)[0]);
			});
	},



	setupHistoryItemContainer (historyItemContainer) {
		if (!this.assignmentHistoryItemContainer && !historyItemContainer) { return; }
		if (!this.rendered) { return; }

		if (historyItemContainer) {
			this.assignmentHistoryItemContainer = historyItemContainer;
		}

		this.mon(this.assignmentHistoryItemContainer, 'reset-assignment', this.markAssignmentAsReset.bind(this));

		if (AssignmentStatus.hasActions(this.assignmentHistoryItemContainer)) {
			this.actionsEl.removeCls('disabled');
		} else {
			this.actionsEl.addCls('disabled');
		}

		if (this.assignmentHistoryItemContainer.isPlaceholder) {
			if (this.attemptSwitcherComponent) {
				this.attemptSwitcherComponent.setProps({
					attempts: []
				});
			}

			return;
		}

		this.assignmentHistoryItemContainer.getInterfaceInstance()
			.then((container) => {
				const attempts = container.Items
					.filter(item => !!item.MetadataAttemptItem)
					.map(item => item.MetadataAttemptItem);

				if (this.attemptSwitcherComponent) {
					this.attemptSwitcherComponent.setProps({
						attempts,
						active: this.activeAttemptItemInterface
					});
					return;
				}

				this.attemptSwitcherComponent = Ext.widget({
					xtype: 'react',
					component: NavigationBar.AttemptSwitcher,
					attempts,
					addHistory: true,
					addRouteTo: true,
					active: this.activeAttemptItemInterface,
					renderTo: this.attemptSwitcherEL,
					getRouteFor: (attempt) => {
						if (attempt.MimeType !== 'application/vnd.nextthought.assessment.userscourseassignmentattemptmetadataitem') { return; }

						return () => this.selectAttemptById(attempt.getID());
					}
				});

				this.on('destroy', () => {
					if (this.attemptSwitcherComponent) {
						this.attemptSwitcherComponent.destroy();
					}
				});
			});
	},


	selectAttemptById (id) {
		if (!this.selectHistoryItem) { return; }

		const items = this.assignmentHistoryItemContainer.get('Items');

		for (let item of items) {
			const attempt = item.get('MetadataAttemptItem');

			if (attempt.getId() === id) {
				this.selectHistoryItem(item);
				return;
			}
		}
	},



	setActiveHistoryItem (historyItem) {
		this.activeHistoryItem = historyItem;
		this.setUpGradeBox(historyItem);

		historyItem.getInterfaceInstance()
			.then((active) => {
				const {MetadataAttemptItem: attempt} = active;

				this.activeAttemptItemInterface = attempt;

				if (this.attemptSwitcherComponent) {
					this.attemptSwitcherComponent.setProps({active: attempt});
				}
			});
	},


	setUpGradeBox: function (historyItem) {
		if (!this.rendered) { return; }

		var grade = historyItem && historyItem.get('Grade'),
			values = grade && grade.getValues(),
			number = values && values.value,
			letter = values && values.letter,
			due = this.assignment.getDueDate(),
			isNoSubmitAssignment = historyItem && historyItem.isSyntheticSubmission(),
			submission = historyItem && historyItem.get('Submission'),
			completed = submission && submission.get('CreatedTime'),
			maxTime = this.assignment.isTimed && this.assignment.getMaxTime(),
			duration = this.assignment.isTimed && historyItem.getDuration(),
			start = this.assignment.get('availableBeginning'),
			status = AssignmentStatus.getRenderData({
				start,
				due,
				completed,
				maxTime,
				duration,
				isNoSubmitAssignment
			});

		if (this.letterEl) {
			this.letterEl.setStyle({display: 'none'});
		}

		if (!grade) {
			console.warn('No grade not even a placeholder');
			this.gradeBoxEl.hide();
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

		if (historyItem) {
			this.mon(historyItem, 'excused-changed', this.excuseGradeStatusChanged.bind(this));
			this.mon(historyItem, 'reset-assignment', this.markAssignmentAsReset.bind(this));
		}
	},

	showActionsMenu: function (e) {
		if (e.getTarget('.disabled') || !this.assignmentHistoryItemContainer) { return; }

		var me = this,
			menu = AssignmentStatus.getActionsMenu(me.assignmentHistoryItemContainer);

		menu.showBy(me.actionsEl, 'tr-br');
	},

	changeGrade: function (number, letter) {
		const historyItemContainer = this.assignmentHistoryItemContainer;

		if (!historyItemContainer) {
			console.error('No assignmentHistory set, cannot change the grade');
			return;
		}

		historyItemContainer.saveGrade(number, letter)
			.then(() => this.fireEvent('grade-saved'))
			.catch((reason) => {
				console.error('Failed to save Grade:', reason);
				Error.raiseForReport(reason);
			})
			.always(() => {
				this.setupHistoryItemContainer(historyItemContainer);
				this.setUpGradeBox(this.activeHistoryItem);
			});
	},

	showGradeMenu: function () {
		if (this.letterEl.hasCls('disabled')) { return; }

		this.gradeMenu.showBy(this.letterEl, 'tl-tl', this.gradeMenu.offset);
	},

	createGradeMenu: function () {
		//Wasn't sure if this needs to be translated or not?
		var items = Grade.getLetterItems();

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
		const historyItem = this.assignmentHistoryItemContainer.getMostRecentHistoryItem();
		var grade = historyItem.get('Grade');

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
		this.setupHistoryItemContainer(this.assignmentHistoryItemContainer);
		this.setUpGradeBox(this.activeHistoryItem);
	},

	openEmail: function (e) {
		var emailRecord = new Email(),
			mailLink = this.studentEnrollment && this.studentEnrollment.getLink('Mail');

		if (!mailLink) { return; }

		emailRecord.set('url', this.studentEnrollment.getLink('Mail'));
		emailRecord.set('Receiver', this.student);

		this.WindowActions.showWindow('new-email', null, e.getTarget(), null, {
			record: emailRecord
		});
	}
});

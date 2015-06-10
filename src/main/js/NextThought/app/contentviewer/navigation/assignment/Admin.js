Ext.define('NextThought.app.contentviewer.navigation.assignment.Admin', {
	extend: 'NextThought.app.contentviewer.navigation.Base',
	alias: 'widget.course-assessment-admin-reader-header',
	ui: 'course-assessment',

	cls: 'admin-reader-header reader-header course-assessment-header assignment-item',

	requires: [
		'NextThought.app.course.assessment.AssignmentStatus',
		'NextThought.app.chat.StateStore'
	],

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks',
		enableChat: 'NextThought.mixins.ChatLinks'
	},


	headerTpl: Ext.DomHelper.markup([
		{cls: 'predicted hidden', cn: [
			{cls: 'label', 'data-qtip': 'Estimated from the grading policy in the Syllabus', html: 'Course Grade'},
			{cls: 'value', html: '{predicted}'}
		]},
		{ cls: 'grade', cn: [
			{ cls: 'label', html: '{gradeTitle} {{{NextThought.view.courseware.assessment.admin.Header.grade}}}'},
			{ cls: 'gradebox', cn: [
				{ tag: 'input', size: 3, type: 'text', value: '{grade}'},
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
			'{create:avatar}',
			{ cls: 'wrap', cn: [
				{ cls: 'title name {presence}', cn: {html: '{displayName}' }},
				{ cls: 'username', cn: {html: '({Username})'}},
				{ cls: 'subtitle actions', cn: [
					{ tag: 'span', cls: 'profile link', html: '{{{NextThought.view.courseware.assessment.admin.Header.profile}}}'},
					{ tag: 'span', cls: 'email link', html: '{{{NextThought.view.courseware.assessment.admin.Header.email}}}'},
					{ tag: 'span', cls: 'chat link', html: '{{{NextThought.view.courseware.assessment.admin.Header.chat}}}'}
				]}
			]}
		]}
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
		excusedEl: '.header .status .excused'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
	},


	beforeRender: function() {
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
			excused: this.__getExcusedTpl()
		});

		this.createGradeMenu();

		this.on({
			emailEl: {click: 'openEmail'},
			letterEl: {click: 'showGradeMenu'},
			gradeEl: {blur: 'gradeChanged', keypress: 'maybeChangeGrade'},
			actionsEl: {click: 'showActionsMenu'}
		});
	},


	__getExcusedTpl: function() {
		var excusedTpl = {cls: 'off', html: 'Excused'},
			grade = this.assignmentHistory && this.assignmentHistory.get && this.assignmentHistory.get('Grade');

		if (grade && grade.get('IsExcused')) {
			excusedTpl.cls = 'on';
		}

		return excusedTpl;
	},


	afterRender: function() {
		var me = this;

		me.callParent(arguments);

		Object.keys(this.renderSelectors).forEach(function(s) {
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

		if (!me.user.get('email')) {
			me.emailEl.hide();
		}

		me.maybeShowChat(me.chatEl);

		this.mon(this.ChatStore, 'presence-changed', function(username, presence) {
			if (username === me.user.getId()) {
				me.nameEl.removeCls('dnd away available unavailable');
				me.nameEl.addCls(presence.getName());
				me.maybeShowChat(me.chatEl);
			}
		});

		if (!this.showingUsername) {
			this.usernameEl.hide();
		}
	},


	setUpGradeBox: function(historyItem) {
		if (!this.assignmentHistory && !historyItem) { return; }

		if (historyItem) {
			this.assignmentHistory = historyItem;
		}

		var grade = this.assignmentHistory.get('Grade'),
			values = grade && grade.getValues(),
			number = values && values.value,
			letter = values && values.letter,
			due = this.assignment.getDueDate(),
			submission = this.assignmentHistory.get('Submission'),
			completed = submission && submission.get('CreatedTime'),
			maxTime = this.assignment.isTimed && this.assignment.getMaxTime(),
			duration = this.assignment.isTimed && this.assignmentHistory.getDuration(),
			status = NextThought.app.course.assessment.AssignmentStatus.getRenderData({
				due: due,
				completed: completed,
				maxTime: maxTime,
				duration: duration
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
			if (status.overdue) {
				this.completedEl.addCls('late');
				this.completedEl.dom.setAttribute('data-qtip', status.overdue.qtip);
				this.completedEl.update(TimeUtils.getNaturalDuration(completed.getTime() - due.getTime(), 1) + ' late');
			} else {
				this.completedEl.addCls('ontime');
				this.completedEl.dom.setAttribute('data-qtip', status.completed.qtip);
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
			this.completedEl.dom.setAttribute('data-qtip', status.due.qtip);
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
	},


	showActionsMenu: function(e) {
		if (e.getTarget('.disabled') || !this.assignmentHistory) { return; }

		var me = this,
			menu = NextThought.app.course.assessment.AssignmentStatus.getActionsMenu(me.assignmentHistory);

		menu.showBy(me.actionsEl, 'tr-br');
	},


	changeGrade: function(number, letter) {
		var me = this,
			historyItem = this.assignmentHistory;

		if (!historyItem) {
			console.error('No assignmentHistory set, cannot change the grade');
			return;
		}

		historyItem.saveGrade(number, letter)
			.then(me.fireEvent.bind(me, 'grade-saved'))
			.fail(function(reason) {
				console.error('Failed to save Grade:', reason);
				Error.raiseForReport(reason);
			})
			.always(function() {
				me.setUpGradeBox();
			});
	},


	showGradeMenu: function() {
		if (this.letterEl.hasCls('disabled')) { return; }

		this.gradeMenu.showBy(this.letterEl, 'tl-tl', this.gradeMenu.offset);
	},


	createGradeMenu: function() {
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


	changeLetterGrade: function(item, status) {
		if (!status) { return; }
		var offset = item.getOffsetsTo(this.gradeMenu),
			x = offset && offset[1];

		this.letterEl.update(item.text);

		this.gradeMenu.offset = [-1, -x];

		this.currentLetter = item.text;

		this.changeGrade(this.currentGrade, this.currentLetter);
	},


	maybeChangeGrade: function(e, el) {
		if (e.getCharCode() === e.ENTER) {
			this.gradeChanged(e, el);
		}
	},


	gradeChanged: function(e, el) {
		this.currentGrade = el.value;

		this.changeGrade(this.currentGrade, this.currentLetter);
	},


	excuseGradeStatusChanged: function() {
		var grade = this.assignmentHistory.get('Grade');

		if (!grade) { return; }

		this.markGradeAsExcused(grade);
	},


	markGradeAsExcused: function(grade) {
		if (!grade || !grade.isModel) { return; }

		var cls = grade.get('IsExcused') === true ? 'on' : 'off',
			rCls = grade.get('IsExcused') === true ? 'off' : 'on';
		this.excusedEl.removeCls(rCls);
		this.excusedEl.addCls(cls);
	},


	markAssignmentAsReset: function() {
		this.excusedEl.removeCls('on');
		this.excusedEl.addCls('off');
		this.setUpGradeBox();
	},


	openEmail: function() {
		var email = this.student.get('email');

		if (email) {
			Globals.sendEmailTo(email);
		}
	}
});

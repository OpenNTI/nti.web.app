Ext.define('NextThought.view.courseware.assessment.admin.Header', {
	extend: 'NextThought.view.courseware.assessment.Header',
	alias: 'widget.course-assessment-admin-header',
	ui: 'course-assessment',

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks',
		enableChat: 'NextThought.mixins.ChatLinks'
	},


	headerTpl: Ext.DomHelper.markup([
		{ cls: 'grade', cn: [
			{ cls: 'label', html: '{gradeTitle} Grade'},
			{ cls: 'late', html: '{late}'},
			{ cls: 'gradebox', cn: [
				{ tag: 'input', size: 3, type: 'text', value: '{grade}'},
				{ cls: 'dropdown letter grade', html: '{letter}'}
			]}
		]},
		{ cls: 'user', cn: [
			{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'}},
			{ cls: 'wrap', cn: [
				{ cls: 'title name {presence}', cn: {html: '{displayName}' }},
				{ cls: 'username', cn: {html: '({Username})'}},
				{ cls: 'subtitle actions', cn: [
					{ tag: 'span', cls: 'profile link', html: 'Profile'},
					{ tag: 'span', cls: 'email link', html: 'Email'},
					{ tag: 'span', cls: 'chat link', html: 'Chat'}
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
		lateEl: '.header .grade .late'
	},


	beforeRender: function() {
		this.callParent();

		var status = 'Open', roster, Username = this.student.get('Username');

		this.currentGrade = '';
		this.currentLetter = '-';

		if (this.assignmentHistory) {
			roster = this.assignmentHistory.get('item').roster;

			(roster || []).forEach(function(r) {
				if (r.Username === Username) {
					status === Username;
				}
			});
		}


		this.showingUsername = status !== 'Open';
		this.renderData = Ext.apply(this.renderData || {}, {
			displayName: this.student.toString(),
			Username: status === 'Open' ? '' : Username,
			gradeTitle: this.gradeTitle || 'Assignment',
			avatarURL: this.student.get('avatarURL'),
			presence: this.student.getPresence().getName()
		});

		this.createGradeMenu();

		this.on({
			emailEl: { click: 'openEmail'},
			letterEl: { click: 'showGradeMenu'},
			gradeEl: { blur: 'gradeChanged', keypress: 'maybeChangeGrade'}
		});
	},

	afterRender: function() {
		var me = this;

		me.callParent(arguments);

		this.setUpGradebox();

		//so the elements wont take up space when hidden
		Object.keys(this.renderSelectors).forEach(function(s) {
			me[s].setVisibilityMode(Ext.Element.DISPLAY);
		});

		//for profile link
		me.user = me.student;
		me.enableProfileClicks(me.profileEl);


		if (this.status !== 'Open') {
			this.usernameEl.update('(' + me.user.getId() + ')');
			this.usernameEl.show();
		}

		if (!me.user.get('email')) {
			me.emailEl.hide();
		}

		me.maybeShowChat(me.chatEl);

		this.mon(Ext.getStore('PresenceInfo'), 'presence-changed', function(username, presence) {
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


	//override these
	setUpGradebox: function() {},
	changeGrade: function() {},

	showGradeMenu: function() {
		if (this.letterEl.hasCls('disabled')) { return; }
		this.gradeMenu.showBy(this.letterEl, 'tl-tl', this.gradeMenu.offset);
	},


	createGradeMenu: function() {
		var items = [
			{text: 'A', checked: this.currentLetter === 'A'},
			{text: 'B', checked: this.currentLetter === 'B'},
			{text: 'C', checked: this.currentLetter === 'C'},
			{text: 'D', checked: this.currentLetter === 'D'},
			{text: 'F', checked: this.currentLetter === 'F'},
			{text: '-', checked: this.currentLetter === '-'}
		];

		this.gradeMenu = Ext.widget('menu', {
			ui: 'nt',
			cls: 'letter-grade-menu',
			plain: true,
			shadow: false,
			width: 60,
			minWidth: 60,
			frame: false,
			border: false,
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


	openEmail: function() {
		var email = this.student.get('email');

		if (email) {
			Globals.sendEmailTo(email);
		}
	}
});

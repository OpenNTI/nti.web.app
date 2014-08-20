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
			{ cls: 'label', html: '{gradeTitle} {{{NextThought.view.courseware.assessment.admin.Header.grade}}}'},
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
		lateEl: '.header .grade .late',
		gradeBoxEl: '.header .grade'
	},


	beforeRender: function() {
		this.callParent();

		var status = this.status || 'Open',
			Username = this.student.get('OU4x4') || this.student.get('Username');

		this.currentGrade = '';
		this.currentLetter = '-';


		this.showingUsername = status !== 'Open';

		this.renderData = Ext.apply(this.renderData || {}, {
			displayName: this.student.toString(),
			Username: this.showingUsername ? Username : '',
			gradeTitle: this.gradeTitle || getString('NextThought.view.courseware.assessment.admin.Header.assignment'),
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


		if (me.showingUsername) {
			me.usernameEl.update('(' + me.user.getId() + ')');
			me.usernameEl.show();
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
		//Wasn't sure if this needs to be translated or not?
		var items = [
			{text: 'A'},
			{text: 'B'},
			{text: 'C'},
			{text: 'D'},
			{text: 'F'},
			{text: '-'}
		];

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


	openEmail: function() {
		var email = this.student.get('email');

		if (email) {
			Globals.sendEmailTo(email);
		}
	}
});

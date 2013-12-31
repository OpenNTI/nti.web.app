Ext.define('NextThought.view.courseware.assessment.admin.Header', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-admin-header',
	ui: 'course-assessment',
	cls: 'course-assessment-admin assignment-item',

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks',
		enableChat: 'NextThought.mixins.ChatLinks'
	},

	renderTpl: Ext.DomHelper.markup([
		//toolbar
		{
			cls: 'toolbar',
			cn: [
				{ cls: 'right controls', cn: [
					{ cls: 'page', cn: [
						{ tag: 'span', html: '{page}'}, ' of ', {tag: 'span', html: '{total}'}
					] },
					{ cls: 'up' },
					{ cls: 'down' }
				] },
				//path (bread crumb)
				{
					cls: 'path-items',
					cn: [
						{ tag: 'tpl', 'for': 'path', cn: [
							{tag: 'span', cls: "path part {[ xindex === xcount? 'current' : xindex === 1? 'root' : '']}", html: '{.}'}
						]}
					]
				}
			]
		},
		//header
		{
			cls: 'header',
			cn: [
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
						{ cls: 'subtitle actions', cn: [
							{ tag: 'span', cls: 'profile link', html: 'Profile'},
							{ tag: 'span', cls: 'email link', html: 'Email'},
							{ tag: 'span', cls: 'chat link', html: 'Chat'}
						]}
					]}
				]}
			]
		}
	]),


	renderSelectors: {
		pathEl: '.toolbar .path-items',
		previousEl: '.toolbar .controls .up',
		nextEl: '.toolbar .controls .down',
		nameEl: '.header .user .wrap .name',
		profileEl: '.header .user .wrap .actions .profile',
		emailEl: '.header .user .wrap .actions .email',
		chatEl: '.header .user .wrap .actions .chat',
		letterEl: '.header .grade .gradebox .letter',
		gradeEl: '.header .grade .gradebox input',
		lateEl: '.header .grade .late'
	},


	beforeRender: function() {
		this.callParent();

		this.currentGrade = '';
		this.currentLetter = '-';

		this.renderData = Ext.apply(this.renderData || {}, {
			displayName: this.student.toString(),
			gradeTitle: this.gradeTitle || 'Assignment',
			path: this.path || [],
			avatarURL: this.student.get('avatarURL'),
			presence: this.student.getPresence().getName(),
			//grade: this.currentGrade,
			//letter: this.currentLetter,
			page: this.page,
			total: this.total
		});

		this.createGradeMenu();

		this.on({
			pathEl: {click: 'onPathClicked'},
			previousEl: { click: 'firePreviousEvent' },
			nextEl: { click: 'fireNextEvent' },
			emailEl: { click: 'openEmail'},
			letterEl: { click: 'showGradeMenu'},
			gradeEl: { blur: 'gradeChanged'}
		});
	},

	afterRender: function(){
		var me = this;

		me.callParent(arguments);

		this.setUpGradebox();

		//so the elements wont take up space when hidden
		Object.keys(this.renderSelectors).forEach(function(s){ 
			me[s].setVisibilityMode(Ext.Element.DISPLAY); 
		});

		//for profile link
		me.user = me.student;
		me.enableProfileClicks(me.profileEl);

		if(!me.user.get('email') && false){
			me.emailEl.hide();
		}

		me.maybeShowChat(me.chatEl);

		this.mon(Ext.getStore('PresenceInfo'), 'presence-changed', function(username, presence){
			if(username === me.user.getId()){
				me.nameEl.removeCls('dnd away available unavailable');
				me.nameEl.addCls(presence.getName());
				me.maybeShowChat(me.chatEl);
			}
		});
	},

	//override these
	setUpGradebox: function(){},
	changeGrade: function(){},

	showGradeMenu: function(){
		if (this.letterEl.hasCls('disabled')) { return; }
		this.gradeMenu.showBy(this.letterEl, 'tl-tl', this.gradeMenu.offset);
	},


	createGradeMenu: function(){
		var items = [
			{text: 'A', checked: this.currentLetter === 'A'},
			{text: 'B', checked: this.currentLetter === 'B'},
			{text: 'C', checked: this.currentLetter === 'C'},
			{text: 'D', checked: this.currentLetter === 'D'},
			{text: 'F', checked: this.currentLetter === 'F'},
			{text: '-', checked: this.currentLetter === '-'}
		];

		this.gradeMenu = Ext.widget('menu',{
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

	
	changeLetterGrade: function(item, status){
		if(!status){ return; }
		var offset = item.getOffsetsTo(this.gradeMenu),
			x = offset &&  offset[1];

		this.letterEl.update(item.text);

		this.gradeMenu.offset = [-1, -x];

		this.currentLetter = item.text;

		this.changeGrade(this.currentGrade, this.currentLetter);
	},


	gradeChanged: function(e, el){
		this.currentGrade = el.value;

		this.changeGrade(this.currentGrade, this.currentLetter);
	},	


	openEmail: function(){
		var email = this.student.get('email') || 'andrew.ligon@nextthought.com';

		if(email){
			Globals.sendEmailTo(email);
		}
	},



	onPathClicked: function(e) {
		var goHome = !!e.getTarget('.root'),
			goNowhere = !!e.getTarget('.current'),
			goUp = !goHome && !goNowhere && !!e.getTarget('.part');

		if (goUp) {
			this.fireGoUp();
		} else if (goHome) {
			this.fireGoUp();
			this.parentView && this.parentView.fireGoUp();
		}
	},


	fireGoUp: function() {
		this.fireEvent('goup', this);
	},


	firePreviousEvent: function() {
		//page is 1 based, and we want to go to the previous index
		var index = this.page - 2;
		if (index < 0) {
			index = this.total - 1;
		}

		this.goTo(index);
	},


	fireNextEvent: function() {
		//page is 1 based, and we want to go to the next index (so, next 0-based index = current page in 1-based)
		var index = this.page;

		if (index > (this.total - 1)) {
			index = 0;
		}

		this.goTo(index);
	},


	goTo: function(index) {
		this.fireEvent('goto', index)
	}
});
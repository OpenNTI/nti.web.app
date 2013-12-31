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
					{ cls: 'label', html: 'Assignment Grade'},
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
		chatEl: '.header .user .wrap .actions .chat'
	},


	beforeRender: function() {
		this.callParent();
		this.renderData = Ext.apply(this.renderData || {}, {
			displayName: this.student.toString(),
			path: this.path || [],
			avatarURL: this.student.get('avatarURL'),
			presence: this.student.getPresence().getName(),
			grade: '100',
			letter: 'A',
			page: this.page,
			total: this.total
		});

		this.on({
			pathEl: {click: 'onPathClicked'},
			previousEl: { click: 'firePreviousEvent' },
			nextEl: { click: 'fireNextEvent' },
			emailEl: { click: 'openEmail'}
		});
	},

	afterRender: function(){
		var me = this;

		me.callParent(arguments);

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
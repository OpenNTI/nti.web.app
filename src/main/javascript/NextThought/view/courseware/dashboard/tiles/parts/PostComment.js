Ext.define('NextThought.view.courseware.dashboard.tiles.parts.PostComment', {
	extend: 'Ext.Component',

	cls: 'post-comment',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'avatar'},
		{cls: 'meta', cn: [
			{cls: 'name'},
			{cls: 'created'}
		]},
		{cls: 'body'},
		{cls: 'actions', cn: [
			{cls: 'comments list-item'},
			{cls: 'reply list-item', html: 'Reply'},
			{cls: 'report list-item', html: 'Report'}
		]}
	]),

	renderSelectors: {
		avatarEl: '.avatar',
		nameEl: '.meta .name',
		createdEl: '.meta .created',
		bodyEl: '.body',
		commentsEl: '.actions .comments',
		replyEl: '.actions .reply',
		reportEl: '.actions .report'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.fillInUser();
		this.fillInCreated();
		this.fillInBody();
		this.fillInComments();
	},


	fillInUser: function() {
		var me = this;

		UserRepository.getUser(me.record.get('Creator'))
			.then(function(user) {
				me.avatarEl.setStyle({backgroundImage: 'url(' + user.get('avatarURL') + ')'});
				me.nameEl.update(user.getName());
			});
	},


	fillInCreated: function() {
		var created = this.record.get('CreatedTime');

		this.createdEl.update(moment(created).format('MMM Do h:mm A'));
	},


	fillInBody: function() {
		this.bodyEl.update(this.record.getBodyText());
	},


	fillInComments: function() {}
});

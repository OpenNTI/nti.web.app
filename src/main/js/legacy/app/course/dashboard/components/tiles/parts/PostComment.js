const Ext = require('@nti/extjs');
const moment = require('moment');

const UserRepository = require('legacy/cache/UserRepository');
const User = require('legacy/model/User');

require('legacy/app/windows/Actions');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.tiles.parts.PostComment', {
	extend: 'Ext.Component',
	cls: 'post-comment',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'avatar-wrapper', cn: ['{user:avatar}']},
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
		avatarEl: '.avatar-wrapper',
		nameEl: '.meta .name',
		createdEl: '.meta .created',
		bodyEl: '.body',
		commentsEl: '.actions .comments',
		replyEl: '.actions .reply',
		reportEl: '.actions .report'
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.isDeleted()) {
			this.avatarEl.setHTML('');
			this.avatarEl.setStyle({backgroundImage: 'url(' + User.BLANK_AVATAR + ')'});
		} else {
			this.fillInUser();
			this.fillInCreated();
		}

		this.fillInBody();
		this.fillInComments();


		this.mon(this.el, 'click', 'itemClicked');
	},

	isDeleted: function () {
		return false;
	},

	itemClicked: function (e) {
		if (this.handleNavigation) {
			e.stopPropagation();
			this.handleNavigation();
		}
	},

	fillInUser: function () {
		var me = this;
		UserRepository.getUser(me.record.get('Creator'))
			.then(function (user) {
				me.avatarEl.setHTML(Ext.DomHelper.createTemplate('{user:avatar}').apply({user: user}));

				me.mon(user, {
					single: true,
					'avatarChanged': me.setAvatar.bind(me, user)
				});

				me.nameEl.update(user.getName());
			});
	},

	setAvatar: function (record) {
		if (this.rendered) {
			this.avatarEl.update(Ext.util.Format.avatar(record));
		}
	},

	fillInCreated: function () {
		var created = this.record.get('CreatedTime');

		this.createdEl.update(moment(created).format('MMM Do h:mm A'));
	},

	fillInBody: function () {
		this.bodyEl.update(this.record.getBodyText());
	},

	fillInComments: function () {}
});

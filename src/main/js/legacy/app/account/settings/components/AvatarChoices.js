const Ext = require('extjs');

require('../../../whiteboard/Utils');


module.exports = exports = Ext.define('NextThought.app.account.settings.components.AvatarChoices', {
	extend: 'Ext.Component',
	alias: 'widget.avatar-choices',

	renderTpl: Ext.DomHelper.markup({
		tag: 'ul',
		cls: 'avatar-choices',
		cn: [
			{tag: 'li', cls: 'custom avatar', cn: [
				{cls: 'avatar-wrapper', html: '{user:avatar}'},
				{cls: 'wrapper', cn: [
					{tag: 'h3', cls: 'title', html: 'Profile Picture'},
					{cn: [
						{tag: 'span', cls: 'editCustom', cn: [
							{tag: 'a', cls: 'editCustom', href: '#editAvatar', html: '{{{NextThought.view.account.settings.AvatarChoices.edit}}}'},
							' | '
						]},
						{tag: 'a', cls: 'uploadCustom', href: '#uploadAvatar', html: '{{{NextThought.view.account.settings.AvatarChoices.upload}}}'}
					]}
				]}
			]}
			// {tag: 'li', cls: 'custom background', cn: [
			//	{cls: 'avatar-wrapper', html: '{user:background}'},
			//	{cls: 'wrapper', cn: [
			//		{tag: 'h3', cls: 'title', html: 'Background Picture'},
			//		{cn: [
			//			{tag: 'span', cls: 'editCustom', cn: [
			//				{tag: 'a', cls: 'editCustom', href: '#editBackground', html: '{{{NextThought.view.account.settings.AvatarChoices.edit}}}'},
			//				' | '
			//			]},
			//			{tag: 'a', cls: 'uploadCustom', href: '#uploadBackground', html: '{{{NextThought.view.account.settings.AvatarChoices.upload}}}'}
			//		]}
			//	]}
			// ]},
		]
	}),

	renderSelectors: {
		list: 'ul.avatar-choices',
		avatarWrapper: 'li.avatar .avatar-wrapper',
		editAvatarChoice: 'li.avatar span.editCustom',
		backgroundWrapper: 'li.background .avatar-wrapper',
		editBackgroundChoice: 'li.background span.editCustom'
	},

	initComponent: function () {
		var me = this,
			u = (me.user || $AppConfig.userObject),
			url = u.get('avatarURL');

		if (!/^data:/i.test(url) && !/@@view$/i.test(url)) {
			url = null;
		}

		me.renderData = Ext.apply(me.renderData || {}, {
			user: u
		});


		me.callParent(arguments);
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this,
			u = $AppConfig.userObject,
			url = u.get('avatarURL');
			// background = u.get('backgroundURL');

		if (!url) {
			me.editAvatarChoice.setVisibilityMode(Ext.dom.Element.DISPLAY);
			me.editAvatarChoice.hide();
		}

		// if (!background) {
		//	me.editBackgroundChoice.setVisibilityMode(Ext.dom.Element.DISPLAY);
		//	me.editBackgroundChoice.hide();
		// }


		me.mon(me.list, 'click', me.clickHandler.bind(me));

		me.mon(me.up('window').down('picture-editor'), 'saved', function () {
			const avatarUrl = u.get('avatarURL');
			//const background = u.get('backgroundURL');

			me.avatarWrapper.dom.innerHTML = Ext.util.Format.avatar(u);
			// me.backgroundURL.dom.innerHTML = Ext.util.Format.background(u);

			if (avatarUrl) {
				me.editAvatarChoice.show();
			}

			// if (background) {
			//	me.editBackgroundChoice.show();
			// }
		});
	},

	clickHandler: function (e) {
		e.stopEvent();

		let action = e.getTarget('a', null, true);

		if (action) {
			action = action.getAttribute('href');

			if (action && this[action.substring(1)]) {
				this[action.substring(1)]();
				return false;
			}
		}
	},

	edit: function (field, src) {
		var w = this.up('account-window'),
			picEditor = w.down('picture-editor');

		picEditor.setField(field);
		picEditor.editMode(src);

		w.changeView({
			associatedPanel: 'picture-editor',
			pressed: true
		});
	},

	upload: function (field) {
		var w = this.up('account-window'),
			picEditor = w.down('picture-editor');

		picEditor.setField(field);
		picEditor.reset();

		w.changeView({
			associatedPanel: 'picture-editor',
			pressed: true
		});
	},

	editAvatar: function () {
		this.edit('avatarURL', $AppConfig.userObject.get('avatarURL'));
	},

	uploadAvatar: function () {
		this.upload('avatarURL');
	},

	editBackground: function () {
		this.edit('backgroundURL', $AppConfig.userObject.get('backgroundURL'));
	},

	uploadBackground: function () {
		this.upload('backgroundURL');
	}
});

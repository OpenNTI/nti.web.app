Ext.define('NextThought.app.account.settings.components.AvatarChoices', {
	extend: 'Ext.Component',
	alias: 'widget.avatar-choices',

	requires: [
		'NextThought.app.whiteboard.Utils'
	],


	renderTpl: Ext.DomHelper.markup({
		tag: 'ul',
		cls: 'avatar-choices',
		cn: [
			{tag: 'li', cls: 'custom', cn: [
				{cls: 'avatar-wrapper', html: '{user:avatar}'},
				{cls: 'wrapper', cn: [
					{tag: 'h3', cls: 'title', html: '{{{NextThought.view.account.settings.AvatarChoices.custom}}}'},
					{cn: [
						{tag: 'span', cls: 'editCustom', cn: [
							{tag: 'a', cls: 'editCustom', href: '#edit', html: '{{{NextThought.view.account.settings.AvatarChoices.edit}}}'},
							' | '
						]},
						{tag: 'a', cls: 'uploadCustom', href: '#upload', html: '{{{NextThought.view.account.settings.AvatarChoices.upload}}}'}
					]}
				]}
			]}
		]
	}),


	renderSelectors: {
		list: 'ul.avatar-choices',
		customAvatarWrapper: 'li.custom .avatar-wrapper',
		customChoice: 'li.custom',
		customChoiceImage: 'li.custom img',
		editCustomChoice: 'li.custom span.editCustom'
	},


	initComponent: function() {
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


	afterRender: function() {
		this.callParent(arguments);

		var me = this,
			u = $AppConfig.userObject,
			url = u.get('avatarURL'),
			selection = me.customChoice;

		if (!url) {
			me.editCustomChoice.setVisibilityMode(Ext.dom.Element.DISPLAY);
			me.editCustomChoice.hide();
		}


		me.select(selection);

		me.mon(me.list, 'click', me.clickHandler.bind(me));

		me.mon(me.up('window').down('picture-editor'), 'saved', function(url) {
			me.customAvatarWrapper.dom.innerHTML = Ext.util.Format.avatar(u);
			me.editCustomChoice.show();
		});
	},


	select: function(li) {
		this.el.select('.selected').removeCls('selected');
		li.addCls('selected');
	},


	clickHandler: function(e) {
		e.stopEvent();

		var item = e.getTarget('li', null, true),
			action = e.getTarget('a', null, true),
			url, changing = false;

		if (action) {
			action = action.getAttribute('href');

			if (action && this[action.substring(1)]) {
				this[action.substring(1)]();
				return false;
			}
		}

		if (item) {
			changing = !item.hasCls('selected');
			this.select(item);
		}
	},


	edit: function() {
		var w = this.up('account-window');

		w.down('picture-editor').editMode(this.customChoiceImage.getAttribute('src'));

		w.changeView({
			associatedPanel: 'picture-editor',
			pressed: true
		});
	},


	upload: function() {
		var w = this.up('account-window');

		w.down('picture-editor').reset();

		w.changeView({
			associatedPanel: 'picture-editor',
			pressed: true
		});
	}
});
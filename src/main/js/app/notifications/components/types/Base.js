export default Ext.define('NextThought.app.notifications.components.types.Base', {
	extend: 'Ext.Component',

	//the mime type this item renders
	statics: {
		mimeType: ''
	},

	showCreator: true,
	wording: '',
	itemCls: '',

	cls: 'item-container',

	titleTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'title', html: '{name}'}).compile(),

	renderTpl: Ext.DomHelper.markup({
		cls: 'item notification {hidden:boolStr("x-hidden")} {previewCls} {itemCls}',
		cn: [
			{cls: 'icon-wrapper'},
			{cls: 'username'},
			{tag: 'span', cls: 'wrapper', cn: [
				{tag: 'span', cls: 'wording'},
				{tag: 'time', cls: 'time', datetime: '{datetime}', html: '{time:ago()}'}
			]}
		]
	}),


	renderSelectors: {
		itemEl: '.item',
		iconEl: '.icon-wrapper',
		usernameEl: '.username',
		wordingEl: '.wording',
		bodyEl: '.body',
		timeEl: '.time'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var time = this.getDisplayTime();

		this.renderData = Ext.apply(this.renderData || {}, {
			hidden: false,
			previewCls: this.showCreator ? 'preview' : 'link',
			itemCls: this.itemCls,
			datetime: Ext.util.Format.date(time, 'c'),
			time: time
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.fillInData();
		this.fillInWording();

		this.mon(this.el, 'click', this.onClicked.bind(this));
	},


	onClicked: function() {
		if (this.navigateToItem) {
			this.navigateToItem(this.record);
		}
	},


	fillInData: function() {
		var me = this,
			creator = me.record.get('Creator');

		function updateAvatar(user) {
			if (me.iconEl) {
				me.iconEl.update(NTIFormat.avatar(user));
			}
		}

		UserRepository.getUser(creator)
			.then(function(user) {
				updateAvatar(user);
				me.mon(user, 'avatarChanged', updateAvatar.bind(me, user));

				if (me.usernameEl) {
					me.usernameEl.update(user.getName());
				}
			});
	},


	fillInWording: function() {
		if (this.wordingEl && this.wordingEl.dom) {
			this.wordingEl.dom.innerHTML = this.wording;
		}
	},


	getDisplayTime: function() {
		var time = this.record.get('EventTime');

		if (!time || time.getTime() === 0) {
			time = this.record.get('Last Modified');
		}

		if (!time || time.getTime() === 0) {
			time = this.record.get('CreatedTime');
		}

		return time;
	}
});

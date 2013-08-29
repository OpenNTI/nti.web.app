Ext.define('NextThought.view.profiles.parts.NoThought', {
	extend: 'Ext.Component',
	alias:  'widget.no-thought',

	mixins: {
		chatLinks: 'NextThought.mixins.ChatLinks'
	},

	cls: 'entry no-blog',

	renderTpl: Ext.DomHelper.markup([
										{tag: 'tpl', 'if': 'isMe', cn: [
											{cls: 'title', html: 'Share your thoughts and ideas with others.'},
											{ cls: 'meta', cn: [
//				{cls:'link more', tag:'span', html:'Learn more'},
												{cls: 'link start', tag: 'span', html: 'Get Started!'}
											]}
										]},
										{tag: 'tpl', 'if': '!isMe', cn: [
											{cls: 'title others', html: 'I\'m still collecting my thoughts...'},
											{ cls: 'meta', cn: [
												{cls: 'link back', tag: 'span', html: 'Go Back'},
												{cls: 'link chat', tag: 'span', html: 'Chat'}
											]}
										]}
									]),

	renderSelectors: {
		chatEl:  '.link.chat',
		startEl: '.link.start',
		backEl:  '.link.back'
	},

	initComponent: function () {
		this.isMe = isMe(this.userObject.get('Username')) && $AppConfig.service.canBlog();
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {isMe: this.isMe});
		this.mixins.chatLinks.constructor.apply(this);
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.isMe) {
			this.mon(this.startEl, 'click', function (e) { this.up('profile-blog').onNewPost(e); }, this);
		}
		else {
			this.mon(this.backEl, 'click', function (e) { history.back(); }, this);
			this.mon(this.chatEl, 'click', this.onChatWith, this);
			this.maybeShowChat(this.chatEl);
		}
	}

});
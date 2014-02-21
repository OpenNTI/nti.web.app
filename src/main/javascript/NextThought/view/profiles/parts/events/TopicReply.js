Ext.define('NextThought.view.profiles.parts.events.TopicReply', {
	extend: 'NextThought.view.profiles.parts.events.PostReply',
	alias: [
		'widget.profile-activity-generalforumcomment-item',
		'widget.profile-activity-generalforumcomment-reply-item'
	],
	description: 'discussion',

	childEls: ['body', 'liked', 'pathEl'],

	mixins: {
		forumPath: 'NextThought.mixins.forum-feature.Path'
	},

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'profile-activity-item', cn: [
			{ cls: 'path', id: '{id}-pathEl'},
			{ cls: 'item', style: 'padding:0;'}
		]},
		'{super}'
	]),

	initComponent: function() {
		this.callParent();
		this.addCls('x-container-profile');
		this.fillInPath();
	},

	redraw: function() {
		if (!this.el) { return; }
		var path = this.pathEl.getHTML();
		this.callParent(arguments);

		this.pathEl.update(path);
	},


	onClick: function() {
		var p = this.post;

		this.fireEvent('show-topic', this, p, this.record);
	}
});

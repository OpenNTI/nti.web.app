Ext.define('NextThought.view.account.activity.Preview',{
	extend: 'Ext.Component',
	alias: 'widget.activity-preview',

	requires: [
		'NextThought.view.annotations.note.Templates'
	],

	cls: 'activity-preview',

	renderSelectors: {
		canvas: 'canvas',
		liked: '.meta .controls .like',
		favorites: '.meta .controls .favorite',
		sharedTo: '.shared-to',
		context: '.context .text',
		text: '.body',

		replyOptions: '.footer .reply-options',
		replyButton: '.footer .reply',
		shareButton: '.footer .share',
		more: '.footer .reply-options .more'
	},

	initComponent: function(){
		this.callParent(arguments);
	},



	afterRender: function(){
		this.callParent(arguments);

		TemplatesForNotes.attachMoreReplyOptionsHandler(this, this.more);
		TemplatesForNotes.updateMoreReplyOptionsLabels(this.more,this.user);
	}

}, function(){
	this.prototype.renderTpl = Ext.DomHelper.markup([
			{cls: 'path'},
			{cls: 'location-label'},
			{cls: 'context', cn:[
				{tag: 'canvas'},
				{cls: 'text',html: 'sup'}
			]},
			{cls: 'footer', cn: [
				{cls: 'body'},
				TemplatesForNotes.getReplyOptions()
			]}
		]);
});

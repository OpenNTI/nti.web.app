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

		var lineage = LocationProvider.getLineage(this.record.get('ContainerId'),true),
			location = lineage.shift();

		lineage.reverse();

		this.renderData = Ext.apply(this.renderData||{},{
			location: location,
			path: lineage.join(' / '),
			contextText: this.record.get('selectedText'),//TODO: better context text
			textContent: this.record.getBodyText ? this.record.getBodyText() : ''
		});
	},



	afterRender: function(){
		this.callParent(arguments);

		TemplatesForNotes.attachMoreReplyOptionsHandler(this, this.more);
		TemplatesForNotes.updateMoreReplyOptionsLabels(this.more,this.user);
	}



}, function(){
	this.prototype.renderTpl = Ext.DomHelper.markup([
			{cls: 'path', html:'{path}'},
			{cls: 'location-label', html:'{location}'},
			{cls: 'context', cn:[
				{tag: 'canvas'},
				{cls: 'text',html: '{contextText}'}
			]},
			{cls: 'footer', cn: [
				{cls: 'body', html: '{textContent}'},
				TemplatesForNotes.getReplyOptions()
			]}
		]);
});

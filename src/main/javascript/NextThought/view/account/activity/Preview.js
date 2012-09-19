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
			location: Ext.String.ellipsis(location,70,false),
			path: lineage.join(' / '),
			contextText: this.record.get('selectedText'),
			textContent: this.record.getBodyText ? this.record.getBodyText() : ''
		});
	},



	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.replyButton, 'click', this.onReply, this);
		this.mon(this.shareButton, 'click', this.onShare, this);

		if(!this.record.canReply || !$AppConfig.service.canShare()){
			this.replyButton.hide();
		}

		if(!$AppConfig.service.canShare()){
			this.shareButton.hide();
		}

		this.el.on('click',this.onReply,this);
		TemplatesForNotes.attachMoreReplyOptionsHandler(this, this.more);
		TemplatesForNotes.updateMoreReplyOptionsLabels(this.more,this.user);
	},


	onReply: function(){
		var rec = this.record, targets;

		if (!rec || rec.get('Class') === 'User'){
			return;
		}

		targets = (rec.get('references') || []).slice();

		try{
			targets.push( rec.getId() );
			this.fireEvent('navigation-selected', rec.get('ContainerId'), targets, $AppConfig.service.canShare());
		}
		catch(er){
			console.error(Globals.getError(er));
		}
	},


	onShare: function(){
		this.fireEvent('share', this.record);
	},


	onFlag: function(){
		this.record.flag(this);
	},


	onChat: function() {
		this.fireEvent('chat', this.record);
	}



}, function(){
	this.prototype.renderTpl = Ext.DomHelper.markup([
			{
				cls: 'header',
				cn:[
					{cls: 'path', html:'{path}'},
					{cls: 'location-label', html:'{location}'},
					{cls: 'context', cn:[
						{tag: 'canvas'},
						{cls: 'text',html: '{contextText}'}
					]}
				]
			},
			{ cls: 'footer', cn: [
				{tag: 'tpl', 'if':'textContent', cn:[{cls: 'body', html: '{textContent}'}]},
				{tag: 'tpl', 'if':'!textContent', cn:[{cls: 'filler'}]},
				TemplatesForNotes.getReplyOptions() ] }
		]);
});

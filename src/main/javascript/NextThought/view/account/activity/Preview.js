Ext.define('NextThought.view.account.activity.Preview',{
	extend: 'Ext.Component',
	alias: 'widget.activity-preview',

	requires: [
		'NextThought.view.annotations.note.Templates',
        'NextThought.cache.LocationMeta'
	],

	cls: 'activity-preview',

	renderSelectors: {
		canvas: 'canvas',
		liked: '.meta .controls .like',
		favorites: '.meta .controls .favorite',
		sharedTo: '.shared-to',
		context: '.context .text',
		text: '.body',
        path: '.path',
        location: '.location-label',

		replyOptions: '.footer .reply-options',
		replyButton: '.footer .reply',
		shareButton: '.footer .share',
		more: '.footer .reply-options .more'
	},

	initComponent: function(){
        var me = this;
		me.callParent(arguments);

		this.renderData = Ext.apply(this.renderData||{},{
			location: 'Loading...',
			path: '&nbsp;',
			contextText: this.record.get('selectedText'),
			textContent: this.record.getBodyText ? this.record.getBodyText() : ''
		});

        LocationMeta.getMeta(me.record.get('ContainerId'),function(meta){
			var lineage = [],
				location = '';

			if(!meta){
				console.warn('No meta for '+me.record.get('ContainerId'));
				Ext.apply(me.renderData, {
					location: '',
					path: ''
				});
			}
			else {
				lineage = LocationProvider.getLineage(meta.NTIID,true);
				location = lineage.shift();
				lineage.reverse();

				Ext.apply(me.renderData, {
					location: location,
					path: lineage.join(' / ')
				});
			}

            if (me.rendered) {
                me.path.update(me.renderData.path);
                me.location.update(me.renderData.location);
            }
        }, this);
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
		TemplatesForNotes.attachMoreReplyOptionsHandler(this, this.more, this.user, this.record);
	},


	onReply: function(event){
		event.preventDefault();
		event.stopPropagation();

		var rec = this.record;

		if (!rec || rec.get('Class') === 'User'){
			return;
		}

		try{
			this.fireEvent('navigation-selected', rec.get('ContainerId'), rec, {reply: Boolean(event.getTarget('.reply'))});
		}
		catch(er){
			console.error(Globals.getError(er));
		}
	},


	onShare: function(event){
		event.preventDefault();
		event.stopPropagation();
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
					{cls: 'location-label', html:'{location:ellipsis(150)}'},
					{cls: 'context', cn:[
						{tag: 'canvas'},
						{cls: 'text',html: '{contextText:ellipsis(400)}'}
					]}
				]
			},
			{ cls: 'footer', cn: [
				{tag: 'tpl', 'if':'textContent', cn:[{cls: 'body', html: '{textContent:ellipsis(200)}'}]},
				{tag: 'tpl', 'if':'!textContent', cn:[{cls: 'filler'}]},
				TemplatesForNotes.getReplyOptions() ] }
		]);
});

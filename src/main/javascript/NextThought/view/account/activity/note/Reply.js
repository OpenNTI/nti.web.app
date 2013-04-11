Ext.define('NextThought.view.account.activity.note.Reply',{
	extend: 'Ext.Component',
	alias: 'widget.activity-preview-note-reply',

	ui: 'reply',

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		flagActions: 'NextThought.mixins.FlagActions',
		profileLinks: 'NextThought.mixins.ProfileLinks'
	},

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'controls', cn:[{cls:'like'}]},
		{ cls: 'avatar', style: { backgroundImage: 'url({avatarURL});'}},
		{ cls: 'wrap', 'data-commentid':'{NTIID}', cn:[
			{ cls: 'meta', cn: [
				{ tag: 'span', html: '{Creator}', cls: 'name link' },
				{ tag: 'span', html: '{relativeTime}', cls: 'time' }
			]},
			{ cls: 'body' },
			{ cls: 'foot', cn:[
				{ tag: 'tpl', 'if':'isModifiable', cn:[
					{ tag:'span', cls: 'edit link', html: 'Edit'},
					{ tag:'span', cls: 'delete link', html: 'Delete'}
				]},
				{ tag: 'tpl', 'if':'!isModifiable', cn:[
					{ tag:'span', cls: 'flag link', html: 'Report'}
				]}
			]}
		] }
	]),


	moreTpl: Ext.DomHelper.createTemplate([' ',{tag:'a', cls:'more', html:'Read More', href:'#'}]),


	renderSelectors: {
		avatarEl: '.avatar',
		nameEl: '.name',

		bodyEl: '.body',

		liked: '.controls .like',

		flagEl: '.flag',
		editEl: '.edit',
		deleteEl: '.delete'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.enableBubble('realign');
	},

	beforeRender: function(){
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		this.mixins.flagActions.constructor.call(this);
		this.callParent(arguments);
		var me = this,
			rd = this.renderData = Ext.apply(this.renderData||{},this.record.getData());
		rd.LastModified = rd['Last Modified'];
		rd.relativeTime = this.record.getRelativeTimeString();
		rd.isModifiable = this.record.isModifiable();
		UserRepository.getUser(rd.Creator,function(u){
			rd.Creator = u.getName();
			Ext.applyIf(rd, u.getData());
			if(me.rendered){
				me.avatarEl.setStyle({backgroundImage:'url('+rd.avatarURL+')'});
				me.nameEl.update(rd.Creator);
				me.fireEvent('realign');
			}
			me.user = u;
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.record.compileBodyContent(this.setBody,this, null, this.self.WhiteboardSize);
		this.enableProfileClicks(this.nameEl, this.avatarEl);
		if(this.deleteEl){
			this.mon(this.deleteEl, 'click', this.deleteComment, this);
		}
		if(this.editEl){
			this.mon(this.editEl, 'click', this.editComment, this);
		}
		this.on('beforedeactivate', this.handleBeforeDeactivate, this);
	},


	onRecordDestroyed: function(cmp){
		console.log('Record has bee destroyed');
		if(cmp.deleteEl){
			cmp.mun(cmp.deleteEl, 'click', cmp.deleteComment, cmp);
		}
		if(cmp.editEl){
			cmp.mun(cmp.editEl, 'click', cmp.editComment, cmp);
		}

		Ext.defer(cmp.destroy, 1, cmp);
	},


	handleBeforeDeactivate: function(){
		var m = Ext.getBody().down('.x-mask');
		// NOTE: for 'reporting' an item, we mask the body
		// but we don't want to dismiss the popout just yet, since we come back to it

		return !(m && m.isVisible());
	},


	setBody: function(html){
		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setBody,this,arguments),this,{single:true});
			return;
		}

		var snip = ContentUtils.getHTMLSnippet(html,180), me = this;
		this.bodyEl.update(snip||html);
		if(snip){
			this.moreTpl.append(this.bodyEl,null,true);
			this.mon(this.bodyEl.down('a.more'),'click', this.expandComment,this);
		}

		DomUtils.adjustLinks(this.bodyEl, window.location.href);
		this.bodyEl.select('img').on('load', function(){
			me.fireEvent('realign');
		});
	},

	deleteComment: function(){
		this.fireEvent('delete-reply', this.record, this, this.onRecordDestroyed);
	},


	editComment: function(){
		console.log('should edit comment');
	},


	expandComment: function(){
		console.log('should expand comment');
	},


	inheritableStatics: {
		WhiteboardSize: 360
	}
});

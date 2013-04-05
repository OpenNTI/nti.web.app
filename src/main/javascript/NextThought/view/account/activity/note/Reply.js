Ext.define('NextThought.view.account.activity.note.Reply',{
	extend: 'Ext.Component',
	alias: 'widget.activity-preview-note-reply',

	ui: 'reply',

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
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


	renderSelectors: {
		avatarEl: '.avatar',
		nameEl: '.name',

		bodyEl: '.body',

		like: '.controls .like',

		flagEl: '.flag',
		editEl: '.edit',
		deleteEl: '.delete'
	},

	beforeRender: function(){
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
			}
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.record.compileBodyContent(this.setBody,this);
	},


	setBody: function(html){
		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setBody,this,arguments),this,{single:true});
			return;
		}
		this.bodyEl.update(html);
	}
});

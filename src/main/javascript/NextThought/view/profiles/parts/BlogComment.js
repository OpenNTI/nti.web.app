Ext.define('NextThought.view.profiles.parts.BlogComment',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-comment',

	mixins: {
		likeAndFavorateActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	cls: 'blog-comment',
	ui: 'blog-comment',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'controls', cn:[{cls:'favorite'},{cls:'like'}]},
		{ cls: 'avatar', style: { backgroundImage: 'url({avatarURL});'}},
		{ cls: 'wrap', 'data-commentid':'{ID}', cn:[
			{ cls: 'meta', cn: [
				{ tag: 'span', html: '{displayName}', cls: 'name link'},
				{ tag:'span', cls: 'datetime', html: '{LastModified:date("F j, Y")} at {LastModified:date("g:m A")}'},
				{ tag: 'tpl', 'if':'isModifiable', cn:[
					//{ tag:'span', cls: 'edit link', html: 'Edit'},
					{ tag:'span', cls: 'delete link', html: 'Delete'}
				]}
			]},
			//flag?
			{ cls: 'body' }
		] }
	]),


	renderSelectors: {
		bodyEl: '.body',
		nameEl: '.name',
		avatarEl: '.avatar',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		editEl: '.meta .edit',
		deleteEl: '.meta .delete'
	},


	initComponent: function(){
		this.mixins.likeAndFavorateActions.constructor.call(this);
		this.callParent();
		this.addEvents(['delete-post']);
		this.enableBubble(['delete-post']);
		this.mon(this.record, 'destroy', this.destroy, this);
	},


	beforeRender: function(){
		var me = this, r = me.record, rd;
		me.callParent(arguments);
		rd = me.renderData = Ext.apply(me.renderData||{},r.getData());
		UserRepository.getUser(r.get('Creator'),function(u){
			Ext.applyIf(rd, u.getData());
			if(this.rendered){
				console.warn('Rendered late');
				me.renderTpl.overwrite(me.el,rd);
			}
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.record.addObserverForField(this, 'body', this.updateContent, this);
		this.updateContent();
		this.bodyEl.selectable();
		if( this.deleteEl ){
			this.mon(this.deleteEl,'click',this.onDeletePost,this);
		}

//		if( this.editEl ){
//			this.mon(this.editEl,'click',this.onEditPost,this);
//		}

		this.reflectLikeAndFavorite(this.record);
		this.listenForLikeAndFavoriteChanges(this.record);
	},


	getRecord: function(){
		return this.record;
	},


	updateContent: function(){
		this.record.compileBodyContent(this.setContent, this);
	},


	setContent: function(html){
		var el = this.bodyEl;

		el.update(html);
		DomUtils.adjustLinks(el, window.location.href);
		el.select('img.whiteboard-thumbnail').each(function(el){
			el.replace(el.up('.body-divider'));
		});
	},

	onDestroy: function(){
		this.record.removeObserverForField(this, 'body', this.updateField, this);
		this.callParent(arguments);
	},


	onDeletePost: function(e){
		e.stopEvent();
		var me = this;
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: 'This will permanently remove this comment.',
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function(str){
				if(str === 'ok'){
					me.fireEvent('delete-post',me.record, me);
				}
			}
		});
	}
});

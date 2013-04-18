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
			]},
			{ cls: 'editor-box reply' }
		]}
	]),


	moreTpl: Ext.DomHelper.createTemplate({tag:'a', cls:'more',cn:[{},{},{}]}),


	renderSelectors: {
		avatarEl: '.avatar',
		nameEl: '.name',

		bodyEl: '.body',

		liked: '.controls .like',

		flagEl: '.flag',
		editEl: '.edit',
		deleteEl: '.delete',
		editorBoxEl: '.editor-box',
		metaEl:'.meta',
		footEl:'.foot',
		ctrEl: '.controls',
		boxEl: '.respond'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.enableBubble('realign');
	},

	beforeRender: function(){
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		this.mixins.flagActions.constructor.call(this);
		this.mixins.likeAndFavoriteActions.constructor.call(this);
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


	getRefItems: function(){ return this.editor ? [this.editor] : []; },


	afterRender: function(){
		this.callParent(arguments);

		var bodyEl = this.bodyEl,
			metaEl = this.metaEl,
			footEl = this.footEl,
			ctrEl = this.ctrEl,
			avatarEl = this.avatarEl,
			hide, show;

		this.record.addObserverForField(this, 'body', this.updateContent, this);
		this.updateContent();

		this.enableProfileClicks(this.nameEl, this.avatarEl);
		if(this.deleteEl){
			this.mon(this.deleteEl, 'click', this.deleteComment, this);
		}
		if(this.editEl){
			this.mon(this.editEl, 'click', this.editComment, this);
		}
		this.on('beforedeactivate', this.handleBeforeDeactivate, this);

		bodyEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		metaEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		footEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		ctrEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		avatarEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

		if(this.record.get('Deleted')){
			this.tearDownFlagging();
		}

		hide = function(){bodyEl.hide(); metaEl.hide(); footEl.hide(); ctrEl.hide(); avatarEl.hide();};
		show = function(){bodyEl.show(); metaEl.show(); footEl.show(); ctrEl.show(); avatarEl.show();};

		this.editor = Ext.widget('nti-editor',{record: this.record, ownerCt:this, renderTo:this.editorBoxEl, 'saveCallback': this.saveCallback});
		this.mon(this.editor,{
			scope: this,
			'activated-editor':hide,
			'deactivated-editor':show,
			'no-body-content': function(editor,el){
				editor.markError(el,'You need to type something');
				return false;
			}
		});

		Ext.defer(this.maybeShowMoreLink, 1, this);
	},


	maybeShowMoreLink: function(){
		var el = this.bodyEl;
		if(el.dom.scrollHeight <= el.getHeight() || this.hasMoreLink){
			return;
		}

		this.moreTpl.insertAfter(el,null,true);
		this.hasMoreLink = true;
		this.mon(this.el.down('a.more'), 'click', this.navigateToComment, this);
	},


	updateContent: function(){
		this.record.compileBodyContent(this.setBody,this, null, this.self.WhiteboardSize);
	},


	navigateToComment: function(){
		var r = this.up('[record]').record,
			rec = this.record;
		this.fireEvent('navigation-selected', r.get('ContainerId'), rec);
	},


	onRecordDestroyed: function(cmp){
		console.log('Record has bee destroyed');
		if(cmp.deleteEl){
			cmp.mun(cmp.deleteEl, 'click', cmp.deleteComment, cmp);
		}
		if(cmp.editEl){
			cmp.mun(cmp.editEl, 'click', cmp.editComment, cmp);
		}

		//Now clear the rest of our field listeners
		if(this.record){
			this.record.removeObserverForField(this, 'body', this.updateContent, this);
		}

		Ext.defer(cmp.destroy, 1, cmp);
	},


	handleBeforeDeactivate: function(){
		var m = Ext.getBody().down('.x-mask');

		if((this.editor && this.editor.isActive())){
			return false;
		}

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
		DomUtils.adjustLinks(this.bodyEl, window.location.href);
		this.bodyEl.select('img').on('load', function(){
			me.fireEvent('realign');
			me.maybeShowMoreLink();
		});

		this.bodyEl.select('img').each(function(el){
			me.mon(el, 'click', me.navigateToComment, me);
		});
		this.bodyEl.select('.whiteboard-container .toolbar').remove();
		this.bodyEl.select('.whiteboard-container .overlay').remove();
	},


	deleteComment: function(){
		this.fireEvent('delete-reply', this.record, this, this.onRecordDestroyed);
	},


	editComment: function(e){
		e.stopEvent();
		this.editor.editBody(this.record.get('body')).activate();
	},


	saveCallback: function(editor, cmp, replyRecord){
		editor.deactivate();
		editor.setValue('');
		editor.reset();
	},


	inheritableStatics: {
		WhiteboardSize: 360
	}
});

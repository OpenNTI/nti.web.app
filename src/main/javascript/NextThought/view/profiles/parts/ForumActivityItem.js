Ext.define('NextThought.view.profiles.parts.ForumActivityItem', {
	extend: 'Ext.container.Container',
	alias: [
		'widget.profile-activity-communityheadlinetopic-item',
		'widget.profile-forum-activity-item'
	],

	requires: [
		'NextThought.editor.Editor',
		'NextThought.layout.component.Natural'
	],

	mixins:{
		forumPath: 'NextThought.mixins.forum-feature.Path',
		flagActions: 'NextThought.mixins.FlagActions',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		profileLink: 'NextThought.mixins.ProfileLinks',
		topicActions: 'NextThought.mixins.ForumTopicLinks'
	},

	defaultType: 'profile-forum-activity-item-reply',
	ui: 'activity',

	layout: 'auto',
	componentLayout: 'natural',
	getTargetEl: function(){return this.body;},
	childEls: ['body'],


	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'topic profile-activity-item',
			cn:[
				{ cls: 'path' },
				{ cls:'item', cn:[
					{ cls: 'avatar link', style: { backgroundImage: 'url({avatarURL});'} },
					{ cls: 'controls', cn: [
						{ cls: 'favorite-spacer' },
						{ cls: 'favorite' },
						{ cls: 'like' }
					]},
					{ cls: 'meta', cn: [
						{ cls: 'subject link', html: '{title}' },
						{ cls: 'stamp', cn: [
							{tag: 'span', cls: 'name link', html: '{Creator}'},
							{tag: 'span', cls: 'time', html:'{date}'}
						]}
					]},
					{ cls: 'body', html: '{body}' },
					{ tag:'tpl', 'if':'values.phantom!==true', cn:{
						cls: 'foot',
						cn: [
							{ cls: 'comments', 'data-postcount':'{PostCount}' ,'data-label': ' Comments',
								html: '{PostCount} Comment{[values.PostCount!=1?\'s\':\'\']}' },
							{tag:'tpl', 'if':'isModifiable', cn:[
								{cls:'edit', html: 'Edit'}
							]},
							{tag:'tpl', 'if':'!isModifiable', cn:[
								{ cls: 'flag', html: 'Report' }
							]},
							{tag:'tpl', 'if': 'isModifiable', cn:[
								{ cls: 'delete', html: 'Delete' }
							]}
						]
					}}]
				}
			]
		},{
			id: '{id}-body',
			cls: 'topic-replies',
			cn:['{%this.renderContainer(out,values)%}']
		},{
			tag: 'tpl', 'if': 'canReply', cn: [
				{cls: 'respond', cn: {
					cn: [
						{tag: 'tpl', 'if': 'canReply', cn: [
							{
								cls: 'reply-options',
								cn: [
									{ cls: 'reply', html: 'Add a comment' }
								]
							}
						]}
					]
				}}
			]
		}
	]),


	renderSelectors: {
		avatarEl: '.avatar',
		nameEl: '.name',

		liked: '.controls .like',
		favorites: '.controls .favorite',
		favoritesSpacer: '.controls .favorite-spacer',

		pathEl: '.path',
		subjectEl: '.subject',
		itemEl: '.item',
		messageBodyEl: '.body',

		commentsEl: '.foot .comments',

		flagEl: '.foot .flag',
		deleteEl: '.foot .delete',
		editEl: '.foot .edit',
		replyEl: '.reply',
		replyBoxEl: '.respond > div',
		respondEl: '.respond',
		replyOptions: '.respond .reply-options'
	},


	beforeRender: function(){
		var me = this, rd, r = me.record,
			h = r.get('headline'),
			username = me.record.get('Creator'),
			store,
			url = r.getLink('contents');

		me.callParent(arguments);
		me.mixins.likeAndFavoriteActions.constructor.call(me);
		me.mixins.flagActions.constructor.call(me);
		me.record.addObserverForField(this, 'PostCount', this.updateCount, this);

		rd = me.renderData = Ext.apply(me.renderData||{},r.getData());

		Ext.apply(rd, {
			'isModifiable': isMe(username),
			headline: h.getData(),
			date: Ext.Date.format(h.get('CreatedTime'),'F j, Y'),
			canReply: Boolean( r && r.getLink('add') )
		});

		h.compileBodyContent(me.setBody,me);

		me.fillInPath();

		UserRepository.getUser(username, function(u){
			me.user = u;
			rd.avatarURL = u.get('avatarURL');
			rd.Creator = u.getName();
			if(me.rendered){
				//oops...we resolved later than the render...update elements
				me.avatarEl.setStyle({backgroundImage:'url('+rd.avatarURL+');'});
				me.nameEl.update(rd.Creator);
			}
		});

		store = me.store = NextThought.store.NTI.create({
			storeId: r.get('Class')+'-'+r.get('ID')+'-activity-view',
			url: url,
			pageSize: 1
		});


		store.proxy.extraParams = Ext.apply(store.proxy.extraParams || {}, {
			sortOn: 'createdTime',
			sortOrder: 'descending'
		});


		store.on('add',this.fillInReplies,this);
		store.on('load',this.fillInReplies,this);

		if(rd.PostCount >0 && !Ext.isEmpty(url)){
			store.load();
		}
		else if(Ext.isEmpty(url)){
			console.error('We think this item has been deleted, no Content link available. Record: ', this.record);
			Ext.defer(this.destroy, 1, this);
		}
	},


	updateCount: function(key, value){
		console.log(arguments);
		if(this.rendered){
			this.commentsEl.update(value+' Comment'+(value > 1 ? 's' : ''));
		}
		else{
			Ext.apply(this.renderedData || {}, {'PostCount':value});
		}
	},


	onDeletePost: function(e){
		e.stopEvent();
		var me = this;
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: 'Deleting this topic will permanently remove it and any comments.',
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
	},


	onDestroy: function(){
		this.record.removeObserverForField(this, 'PostCount', this.updateCount, this);

		if( this.editor ) {
			delete this.editor.ownerCt;
			this.editor.destroy();
			delete this.editor;
		}

		this.callParent(arguments);
	},


	getRecord: function(){
		return this.record;
	},


	getRefItems: function(){
		var ret = this.callParent(arguments)||[];
		if( this.editor ){
			ret.push(this.editor);
		}
		return ret;
	},


	fillInReplies: function(s,recs){
		this.removeAll(true);
		if(recs){
			this.add(Ext.Array.map(recs,function(r){
				return {record: r};
			}));
		}
	},


	afterRender: function(){
		this.callParent(arguments);

		var box = this.replyOptions;

		if( this.deleteEl ){
			this.mon(this.deleteEl,'click',this.onDeletePost,this);
		}

		if(this.commentsEl){
			this.mon(this.commentsEl,'click',this.forumClickHandlerGoToComments,this);
		}
		if(this.editEl){
			this.mon(this.editEl, 'click', this.navigateToTopicForEdit, this);
		}

		this.enableProfileClicks(this.avatarEl,this.nameEl);

		this.mon(this.pathEl,'click', this.forumClickHandler,this);
		this.mon(this.subjectEl, 'click', this.forumClickHandler, this);
		this.mon(this.messageBodyEl,'click',this.bodyClickHandler,this);

		this.reflectFlagged(this.record);
		this.listenForFlagChanges(this.record);

		this.reflectLikeAndFavorite(this.record);
		this.listenForLikeAndFavoriteChanges(this.record);

		if(this.replyEl && box){
			this.mon(this.replyEl,'click',this.showEditor,this);
			this.editor = Ext.widget('nti-editor',{ownerCt: this, renderTo:this.replyBoxEl});
			box.setVisibilityMode(Ext.dom.Element.DISPLAY);

			this.mon(this.editor,{
				scope: this,
				'activated-editor':Ext.bind(box.hide,box,[false]),
				'deactivated-editor':Ext.bind(box.show,box,[false]),
				'no-body-content': function(editor,bodyEl){
					editor.markError(bodyEl,'You need to type something');
					return false;
				}
			});
		}

		this.mon(this.record,'destroy',this.destroy,this);
	},

	bodyClickHandler: function(event){
		event.stopEvent();
		var me = this,
			a = event.getTarget('a');

		if(a){
			//link clicked
			if(me.fireEvent('navigate-to-href',me,a.href)){
				return false;
			}
		}
	},

	showEditor: function(){
		this.editor.reset();
		this.editor.activate();
		this.editor.focus(true);
	},


	setBody: function(text){
		if(!this.rendered){
//			this.renderData.body = text;
			this.on('afterrender',Ext.bind(this.setBody,this,arguments));
			return;
		}
		this.messageBodyEl.update(text);
		this.messageBodyEl.select('.whiteboard-container .toolbar').remove();
		this.messageBodyEl.select('.whiteboard-container .overlay').remove();
	},


	click: function(){
		alert("Clicked");
		return false;
	}

});



Ext.define('NextThought.view.profiles.parts.ForumActivityItemReply', {
	extend: 'Ext.Component',
	alias: 'widget.profile-forum-activity-item-reply',

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		flagActions: 'NextThought.mixins.FlagActions'
	},

	renderTpl: Ext.DomHelper.markup({
		cls: 'reply profile-activity-reply-item',
		cn: [
			{ cls: 'avatar', style: { backgroundImage: 'url({avatarURL});'} },
			{ cls: 'meta', cn: [
				{ cls: 'controls', cn: [
					{ cls: 'favorite-spacer' },
					{ cls: 'like' }]},
				{ tag: 'span', cls: 'name link', html: '{Creator}' },' ',
				{ tag: 'span', cls: 'time', html: '{date}' }
			]},
			{ cls: 'body', html: '{body}' },
			{ cls: 'respond', cn: [
				{cls: 'reply-options', cn:[
					{tag:'tpl', 'if':'isModifiable', cn:[
						{cls:'edit', html: 'Edit'}
					]},
					{tag:'tpl', 'if':'!isModifiable && !Deleted', cn:[
						{ cls: 'flag', html: 'Report' }
					]},
					{tag:'tpl', 'if': 'isModifiable', cn:[
						{ cls: 'delete', html: 'Delete' }
					]}
				]}
			]}
		]
	}),

	renderSelectors: {
		avatarEl: '.avatar',
		nameEl: '.name',
		messageBodyEl: '.body',
		deleteEl: '.delete',
		editEl: '.edit',
		flagEl: '.flag',
		liked: '.controls .like',
		respondEl: '.respond',
		controlOptions : '.reply-options',
		metaEl: '.meta'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.mixins.flagActions.constructor.call(this);
		this.mon(this.record, 'destroy', this.onRecordDestroyed, this);
	},

	beforeRender: function(){
		var me = this, rd, r = me.record,
			username = me.record.get('Creator');

		me.callParent(arguments);
		me.mixins.likeAndFavoriteActions.constructor.call(me);

		rd = me.renderData = Ext.apply(me.renderData||{},r.getData());
		rd.date = Ext.Date.format(r.get('CreatedTime'),'F j, Y');
		r.compileBodyContent(me.setBody,me);

		UserRepository.getUser(username, function(u){
			me.user = u;
			rd.avatarURL = u.get('avatarURL');
			rd.Creator = u.getName();
			if(me.rendered){
				//oops...we resolved later than the render...update elements
				me.avatarEl.setStyle({backgroundImage:'url('+rd.avatarURL+');'});
				me.nameEl.update(rd.Creator);
			}
		});
	},


	getRefItems: function () {
		return this.editor ? [this.editor] : [];
	},

	afterRender: function(){
		this.callParent(arguments);

		debugger;
		var optionsEl = this.controlOptions,
			bodyEl = this.messageBodyEl,
			metaEl = this.metaEl,
			avatarEl = this.avatarEl,
			show, hide;

		this.record.addObserverForField(this, 'body', this.updateContent, this);
		this.reflectLikeAndFavorite(this.record);
		this.listenForLikeAndFavoriteChanges(this.record);
		this.mon(this.messageBodyEl,'click',this.bodyClickHandler,this);
		this.respondEl.setVisibilityMode(Ext.Element.DISPLAY);

		if(this.deleteEl){
			this.mon(this.deleteEl, 'click', this.onDelete, this);
		}

		if(this.editEl){
			this.mon(this.editEl, 'click', this.onEdit, this);
			this.messageBodyEl.setVisibilityMode(Ext.Element.DISPLAY);
			this.avatarEl.setVisibilityMode(Ext.Element.DISPLAY);
			this.metaEl.setVisibilityMode(Ext.Element.DISPLAY);
			this.controlOptions.setVisibilityMode(Ext.Element.DISPLAY);

			hide = function(){
				optionsEl.hide();
				bodyEl.hide();
				metaEl.hide();
				avatarEl.hide();
			};
			show = function(){
				optionsEl.show();
				bodyEl.show();
				metaEl.show();
				avatarEl.show();
			};

			this.editor = Ext.widget('nti-editor', { record: this.record, renderTo: this.respondEl, ownerCt: this });
			this.mon(this.editor, {
				'activated-editor' : hide,
				'deactivated-editor' : show,
				'no-body-content': function (editor, el) {
					editor.markError(el, 'You need to type something');
					return false;
				}
			});
		}

		if(this.record.get('Deleted') === true){
			this.respondEl.hide();
		}
	},


	onRecordDestroyed: function () {
		//First remove the delete and edit link listeners followed by the els
		if (this.deleteEl) {
			this.mun(this.deleteEl, 'click', this.onDeletePost, this);
			this.deleteEl.remove();
		}

		if (this.editEl) {
			this.mun(this.editEl, 'click', this.onEditPost, this);
			this.editEl.remove();
		}

		//Now tear down like, favorites and flagging
		this.tearDownLikeAndFavorite();
		this.tearDownFlagging();

		if(this.flagEl){
			this.flagEl.remove();
			this.respondEl.remove();
		}

		//Now clear the rest of our field listeners
		this.record.removeObserverForField(this, 'body', this.updateContent, this);

		//Now update the body to the same text the server uses.
		this.messageBodyEl.update('This item has been deleted.');
		this.addCls('deleted');
	},


	onDelete: function(){
		this.fireEvent('delete-topic-comment', this.record, this);
	},


	onEdit: function(){
		this.editor.editBody(this.record.get('body'));
		this.editor.activate();
	},


	updateContent: function(){
		this.record.compileBodyContent(this.setBody, this);
	},


	bodyClickHandler: function(event){
		event.stopEvent();
		var me = this,
			a = event.getTarget('a');

		if(a){
			//link clicked
			if(me.fireEvent('navigate-to-href',me,a.href)){
				return false;
			}
		}
	},

	setBody: function(html){
		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setBody,this,arguments),this);
			return;
		}

		var el = this.messageBodyEl, me = this;
		el.update(html);
		DomUtils.adjustLinks(el, window.location.href);
		el.select('img.whiteboard-thumbnail').each(function (el) {
			el.replace(el.up('.body-divider'));
		});

		el.select('img').each(function (img) {
			img.on('load', function () {
				me.up('[record]').fireEvent('sync-height');
			});
		});


		this.messageBodyEl.select('.whiteboard-container .toolbar').remove();
		this.messageBodyEl.select('.whiteboard-container .overlay').remove();
	}
});

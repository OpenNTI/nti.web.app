Ext.define('NextThought.view.profiles.parts.ForumActivityItem', {
	extend: 'Ext.container.Container',
	alias: [
		'widget.profile-activity-communityheadlinetopic-item',
		'widget.profile-forum-activity-item'
	],

	requires: [
		'NextThought.editor.Editor'
	],

	mixins:{
		flagActions: 'NextThought.mixins.FlagActions',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		topicActions: 'NextThought.mixins.ForumTopicLinks'
	},

	defaultType: 'profile-forum-activity-item-reply',
	ui: 'activity',

	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	pathTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'span',
		cls: 'path-part',
		html: '{[values.title!==\'Discussion Board\'? values.title : values.Creator]}',
		'data-ntiid':'{NTIID}',
		'data-id':'{ID}',
		'data-href':'{href}'
	})),

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'topic profile-activity-item',
			cn:[
				{ cls: 'path' },
				{ cls:'item', cn:[
					{ cls: 'avatar', style: { backgroundImage: 'url({avatarURL});'} },
					{ cls: 'controls', cn: [
						{ cls: 'favorite-spacer' },
						{ cls: 'favorite' },
						{ cls: 'like' }
					]},
					{ cls: 'meta', cn: [
						{ cls: 'subject', html: '{[values.phantom?\'(Deleted) \':\'\']}{title}' },
						{ cls: 'stamp', cn: [
							{tag: 'span', cls: 'name link', html: '{Creator}'},
							{tag: 'span', cls: 'separator', html: ' '},
							{tag: 'span', cls: 'time', html:'{date}'},
							{tag: 'span', cls: 'separator', html: ' &middot; '},
							{tag: 'span', cls: 'shared-to link', html: 'Private'}
						]}
					]},
					{ cls: 'body', html: '{body}' },
					{ tag:'tpl', 'if':'values.phantom!==true', cn:{
						cls: 'foot',
						cn: [
							{ cls: 'comments', 'data-label': ' Comments',
								html: '{PostCount} Comment{[values.PostCount!=1?\'s\':\'\']}' },
							{ cls: 'flag', html: 'Report' },
							{ cls: 'delete', html: 'Delete' }
						]
					}}]
				}
			]
		},{
			id: '{id}-body',
			cls: 'topic-replies',
			tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}')
		},{
			cls: 'respond', cn: {
			cn: [ {
				cls: 'reply-options',
				cn: [
					{ cls: 'reply', html: 'Add a comment' }
				]
			} ]}
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

		commentsEl: '.comments',

		flagEl: '.foot .flag',
		deleteEl: '.foot .delete',
		replyEl: '.reply',
		replyBoxEl: '.respond > div',
		respondEl: '.respond'
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

		rd = me.renderData = Ext.apply(me.renderData||{},r.getData());
		rd.headline = h.getData();
		rd.date = Ext.Date.format(h.get('CreatedTime'),'F j, Y');
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
			sortOn: 'lastModified',
			sortOrder: 'descending'
		});


		store.on('add',this.fillInReplies,this);
		store.on('load',this.fillInReplies,this);

		if(rd.PostCount >0 && !Ext.isEmpty(url)){
			store.load();
		}
		else if(Ext.isEmpty(url)){
			rd.phantom = true;
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


	getRecord: function(){
		return this.record;
	},


	getRefItems: function(){
		var ret = this.callParent(arguments)||[];
		ret.push(this.editor);
		return ret;
	},


	fillInReplies: function(s,recs){
		this.removeAll(true);
		this.add(Ext.Array.map(recs,function(r){
			return {record: r};
		}));
	},


	fillInPath: function(data){
		if(!data){
			this.fireEvent('fill-in-path', this, this.record, Ext.bind(this.fillInPath,this));
			return;
		}
		else if(!this.rendered){
			this.on('afterrender',Ext.bind(this.fillInPath,this,[data]),this,{single:true});
			return;
		}

		///OK! lets do this finally
		var me = this,
			el = me.pathEl,
			t = me.pathTpl;

		data = data.slice();
		data.unshift('forums');

		Ext.each(data, function(o){
			if(!o){return;}

			t.append(el, o.getData ? o.getData() : {
				title: o
			});
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		var box = this.replyBoxEl;


		this.editor = Ext.widget('nti-editor',{ownerCt: this, renderTo:this.respondEl});

		this.mon(this.replyEl,'click',this.showEditor,this);

		if( this.deleteEl ){
			this.mon(this.deleteEl,'click',this.onDeletePost,this);
		}

		this.mon(this.pathEl,'click', this.forumClickHandler,this);

		this.reflectLikeAndFavorite(this.record);
		this.listenForLikeAndFavoriteChanges(this.record);

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

		this.mon(this.record,'destroy',this.destroy,this);
	},


	showEditor: function(){
		this.editor.reset();
		this.editor.activate();
		this.editor.focus(true);
	},


	setBody: function(text){
		if(!this.rendered){
			this.renderData.body = text;
			return;
		}
		this.messageBodyEl.update(text);
	}

});



Ext.define('NextThought.view.profiles.parts.ForumActivityItemReply', {
	extend: 'Ext.Component',
	alias: 'widget.profile-forum-activity-item-reply',

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
			{ cls: 'body', html: '{body}' }
		]
	}),

	renderSelectors: {
		avatarEl: '.avatar',
		nameEl: '.name',
		messageBodyEl: '.body',

		liked: '.controls .like'
	},

	beforeRender: function(){
		var me = this, rd, r = me.record,
			username = me.record.get('Creator');

		me.callParent(arguments);

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


	setBody: function(text){
		if(!this.rendered){
			this.renderData.body = text;
			return;
		}
		this.messageBodyEl.update(text);
	}
});

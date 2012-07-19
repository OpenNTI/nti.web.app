Ext.define('NextThought.view.annotations.note.GutterWidget',{
	extend: 'Ext.Component',
	alias: 'widget.note-gutter-widget',

	requires: [
		'NextThought.cache.UserRepository',
		'NextThought.view.annotations.note.Templates'
	],

	renderTpl: Ext.DomHelper.createTemplate([
		{
			cls: 'note-gutter-widget single',
			cn: [{
				cls: 'meta',
				cn: [{
					cls: 'controls',
					cn: [{ cls: 'favorite' },{ cls: 'like' }]
				},{
					tag: 'span',
					cls: 'name'
				},
					{tag: 'span', cls: 'separator', html: ' - '},
					{tag: 'span', cls: 'time'}
				]
			},{ cls: 'text' },{
				cls: 'respond',
				cn: [
					TemplatesForNotes.getReplyOptions()
				]
			},
			{cls: 'mask'}]
		}
	]).compile(),

	renderSelectors: {
		liked: '.meta .controls .like',
		favorites: '.meta .controls .favorite',
		name: '.meta .name',
		time: '.meta .time',
		text: '.text',
		responseBox: '.respond',
		editor: '.respond .editor',
		replyOptions: '.respond .reply-options',
		replyButton: '.respond .reply',
		startChatButton: '.respond .chat',
		more: '.respond .reply-options .more'
	},

	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		me.setRecord(me.record);

		me.mon(me.liked, {
			scope: me,
			click: function(e){
				e.stopEvent();
				me.record.like(me.liked);
				return false;
			}
		});

		me.mon(me.favorites, {
			scope: me,
			click: function(e){
				e.stopEvent();
				me.record.favorite(me.favorites);
				return false;
			}
		});

		me.mon(me.startChatButton, {
			scope: me,
			click: me.startChat
		});

		TemplatesForNotes.attachMoreReplyOptionsHandler(me, me.more);

		//Stop div mouseup from opening window when clicking on buttons...
		me.mon(new Ext.CompositeElement([me.liked, me.favorites, me.startChatButton]), {
			scope: me,
			mouseup: function(e){
				e.stopEvent();
				return false;
			}
		});
	},


	onParentScroll: function(event,el){
		TemplatesForNotes.replyOptionsScroll.call(this,event,el,{optionsEl:this.more});
	},


	setRecord: function(r){
		if (r.phantom) return;
		this.record = r;
		var me = this;
		if(!me.rendered){return;}
		UserRepository.getUser(r.get('Creator'),me.fillInUser,me);
		me.time.update(r.getRelativeTimeString());
		me.liked.update(r.getFriendlyLikeCount());
		if (r.isLiked()){
			this.liked.addCls('on');
		}
		if (r.isFavorited()){
			this.favorites.addCls('on');
		}

		me.text.update(r.getBodyText());
	},


	fillInUser: function(user){
		if(Ext.isArray(user)){user = user[0];}
		this.name.update(user.getName());
		TemplatesForNotes.updateMoreReplyOptionsLabels(this.more,user);
	},


	onShare: function(){
		this.fireEvent('share', this.record);
	},


	onDelete: function(){
		this.record.destroy();
	},


	startChat: function(){
		this.fireEvent('chat', this.record);
	}

});

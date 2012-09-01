Ext.define('NextThought.view.annotations.note.GutterWidget',{
	extend: 'Ext.Component',
	alias: 'widget.note-gutter-widget',

	requires: [
		'NextThought.cache.UserRepository',
		'NextThought.view.annotations.note.Templates'
	],


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
		var me = this,
			r = me.record,
			mouseUpDivs = [me.liked, me.favorites];
		me.callParent(arguments);

		me.setRecord(r);

		me.mon(me.liked, {
			scope: me,
			click: function(e){
				e.stopEvent();
				r.like(me.liked);
				return false;
			}
		});

		me.mon(me.favorites, {
			scope: me,
			click: function(e){
				e.stopEvent();
				r.favorite(me.favorites);
				return false;
			}
		});

		if($AppConfig.service.canChat()){
			me.mon(me.startChatButton, 'click', me.startChat, me);
			mouseUpDivs.push(me.startChatButton);
		}
		else {
			me.startChatButton.remove();
		}

		me.liked.update(r.getFriendlyLikeCount());
		me.liked[(r.isLiked()?'add':'remove')+'Cls']('on');
		me.favorites[(r.isFavorited()?'add':'remove')+'Cls']('on');

		TemplatesForNotes.attachMoreReplyOptionsHandler(me, me.more);

		//Stop div mouseup from opening window when clicking on buttons...
		me.mon(new Ext.CompositeElement(mouseUpDivs), {
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
		if (r.phantom) { return; }
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

		r.on({
			scope: this,
			single: true,
			updated: this.setRecord,
			changed: function(){me.setRecord(me.record);}
		});
	},


	fillInUser: function(user){
		this.name.update(Ext.String.ellipsis(user.getName(),18));
		TemplatesForNotes.updateMoreReplyOptionsLabels(this.more,user);
	},


	onEdit: function(){
		this.annotation.openWindow(false,true);
	},

	onShare: function(){
		this.fireEvent('share', this.record);
	},


	onFlag: function(){
		this.record.flag(this);
	},


	onDelete: function(){
		this.record.destroy();
	},


	startChat: function(){
		this.fireEvent('chat', this.record);
		return;
	}

},function(){
	this.prototype.renderTpl = Ext.DomHelper.markup([
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
	]);
});

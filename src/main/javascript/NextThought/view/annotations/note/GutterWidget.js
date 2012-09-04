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
		var likeTooltip, favoriteTooltip;
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

		//CUTZ Seems unfortunate that this must be here and in Main.js.
		//It doesn't seem like there is any shared code between the two
		//that could be doing this.  Hopefully I am just missing it?
		//Note we have a mix of native and extjs tooltips in the app.
		//If we specify both a title and a data-qtip we can get multiple
		//tips displayed when transitioning from an element showing a native
		//tooltip.  It's not clear to me which method we prefer.
		likeTooltip = r.isLiked() ? 'Liked' : 'Like';
		favoriteTooltip = r.isFavorited() ? 'Bookmarked' : 'Add to bookmarks';
		this.liked.set({'title': likeTooltip});
		this.favorites.set({'title': favoriteTooltip});

		me.text.update(r.getBodyText());

		r.on({
			scope: this,
			single: true,
			updated: this.setRecord,
			changed: function(){me.setRecord(me.record);}
		});
	},


	fillInUser: function(user){
		if(!this.rendered){
			return;
		}
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

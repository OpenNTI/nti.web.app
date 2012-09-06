Ext.define('NextThought.view.annotations.note.GutterWidget',{
	extend: 'Ext.Component',
	alias: 'widget.note-gutter-widget',

	requires: [
		'NextThought.cache.UserRepository',
		'NextThought.view.annotations.note.Templates'
	],


	renderSelectors: {
		name: '.meta .name',
		time: '.meta .time',
		replyCount: 'div.reply-count',
		text: '.text',
		responseBox: '.respond',
		editor: '.respond .editor',
		replyOptions: '.respond .reply-options',
		replyButton: '.respond .reply',
		shareButton: '.respond .share',
		more: '.respond .reply-options .more'
	},

	afterRender: function(){
		var me = this,
			r = me.record,
			mouseUpDivs = [me.shareButton];
		me.callParent(arguments);

		me.setRecord(r);

		me.mon(me.shareButton, {
			scope: me,
			click: function(e){
				e.stopEvent();
				this.onShare();
				return false;
			}
		});

		if( !$AppConfig.service.canShare() ){
			me.replyButton.remove();
			me.shareButton.remove();
			mouseUpDivs.pop();
		}

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
		me.replyCount.update(r.getReplyCount().toString());

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
		TemplatesForNotes.updateMoreReplyOptionsLabels(this.more, user, this.record.isFlagged());
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


	onChat: function(){
		this.fireEvent('chat', this.record);
		return;
	}

},function(){
	this.prototype.renderTpl = Ext.DomHelper.markup([
		{
			cls: 'note-gutter-widget single',
			cn: [
				{tag: 'div', cls: 'reply-count', html:''},
				{cls: 'meta',
				cn: [
					{
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

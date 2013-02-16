Ext.define('NextThought.view.profiles.parts.ActivityItem',{
	extend: 'NextThought.view.annotations.note.Panel',
	requires: [
		'NextThought.util.Content',
		'NextThought.view.profiles.parts.ActivityItemReply'
	],
	alias: [
		'widget.profile-activity-item',
		'widget.profile-activity-default-item',
		'widget.profile-activity-note-item'
	],
	defaultType: 'profile-activity-item-reply',
	autoFillInReplies: false,

	renderSelectors: {
		avatar: '.avatar',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		favoritesSpacer: '.controls .favorite-spacer',
		locationEl: '.location',
		contextEl: '.context',
		subjectEl: '.subject',
		locationIcon: '.icon',
		commentsEl: '.comments',
		editEl: '.reply-options .edit',
		flagEl: '.reply-options .flag',
		deleteEl: '.reply-options .delete'
	},

	initComponent: function(){
		if(!this.record || !this.record.isModel){
			Ext.Error.raise('We need a record for this component');
		}
		this.callParent(arguments);
	},


	setRecord: function(record){
		this.callParent(arguments);
		this.maybeFillIn();
	},


	afterRender: function(){
		this.callParent(arguments);
		if(this.commentsEl.dom){
			this.mon(this.commentsEl, 'click', this.clickedRevealAllReplies,this);
		}
		this.mon( this.replyButton, 'click', this.clickedRevealAllReplies, this);
		this.mon( this.deleteEl, 'click', this.onDelete, this);
		this.mon( this.editEl, 'click', this.onEdit, this);
		this.mon( this.flagEl, 'click', this.onFlag, this);
		this.mon( this.contextEl, 'click', this.goToObject, this);
		this.on( 'reveal-replies', this.clickedRevealAllReplies);
	},


	clickedRevealAllReplies: function(){
		this.mun( this.replyButton, 'click', this.clickedRevealAllReplies, this);
		this.commentsEl.remove();
		delete this.commentsEl;
		this.fillInReplies();
	},


	onRemove: function(){
		if(!this.isExpanded()){
			this.clickedRevealAllReplies();
		}
		this.callParent(arguments);
	},

	onDelete: function(){
		var me = this;
		Ext.Msg.show({
			msg: 'The following action will delete your note',
			buttons: 9, // bitwise result of: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function(str){
				if(str === 'ok'){
					me.record.destroy();
					me.adjustRootsReferenceCount(me.record);
				}
			}
		});
	},


	isExpanded: function(){ return !this.commentsEl; },


	maybeFillIn: function(){
		var me = this,
			D = Ext.dom.Element.DISPLAY,
			count,subject,
			loaded = me.loaded,
			onScreen = loaded || (me.el && me.el.first().isOnScreenRelativeTo(Ext.get('profile'),{bottom:1000}));

		if(loaded || !onScreen){return;}

		me.loaded = true;

		count = me.record.get('ReferencedByCount');
		if(typeof count === 'number'){
			me.commentsEl.update(count+me.commentsEl.getAttribute('data-label'));
			if(count){
				me.loadLatestReply();
			}
		}
		else {
			me.commentsEl.remove();
			//also remove response box for things that don't look like notes
			if(me.responseBox){
				me.responseBox.remove();
			}
		}

		subject = me.record.get('subject');
		me.subjectEl.update(subject||'Subject');
		if(!subject){
			me.subjectEl.addCls('no-subject');
			me.name.addCls('no-subject');
		}

		me.flagEl.setVisibilityMode(D);
		me.editEl.setVisibilityMode(D);
		me.deleteEl.setVisibilityMode(D);

		if(isMe(me.record.get('Creator'))){
			me.flagEl.hide();
		}
		else {
			me.editEl.hide();
			me.deleteEl.hide();
		}

		LocationMeta.getMeta(me.record.get('ContainerId'),me.setLocation,me);
		if(me.root){
			me.contextEl.show();
			me.contextEl.mask('Loading...');
			me.loadContext(function(){
				me.contextEl.unmask();
			});
		}
	},


	loadLatestReply: function(){
		var me = this,
			r = me.record;

		function cb(store, records){
			if(store.getCount() !== 1){
				console.error('We did not recieve what we expected.', arguments);
			}

			var rec = null;
			//get the newest record (should only be 1, so this should nearly be a no-op)
			store.each(function(r){
				if(!rec || rec.get('CreatedTime') < r.get('CreatedTime')){ rec = r; } });

			if(rec){ me.add({record: rec}); }
		}

		r.loadReplies(cb,me,1,{sortOn: 'CreatedTime', sortOrder: 'descending'});
	},


	loadContext: function(fin){
		var me = this,
			r = me.record,
			cid = r.get('ContainerId'),
			metaInfo,
			C = ContentUtils;

		function parse(content){
			var dom = C.parseXML(C.fixReferences(content, metaInfo.absoluteContentRoot));
			me.setContext(dom,dom);
		}

		LocationMeta.getMeta(cid, function(meta){
			metaInfo = meta;
			ContentUtils.spider(cid,fin,parse);
		}, me);
	},


	goToObject: function(){
		var rec = this.record,
			cid = rec ? rec.get('ContainerId') : null;
		rec = this.record;
		if(rec && cid){
			this.fireEvent('navigation-selected', cid, rec, null);
		}
	},

	
	setLocation: function(meta){
		if(!meta){return;}

		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setLocation,this,arguments),this,{single:true});
			return;
		}

		this.locationEl.update(meta.getPathLabel());
		this.locationIcon.setStyle({
			backgroundImage: Ext.String.format('url({0})',meta.getIcon())
		});

		this.locationEl.hover(
				function(){Ext.fly(this).addCls('over');},
				function(){Ext.fly(this).removeCls('over');});

		this.locationEl.on('click',function(){
			me.fireEvent('navigation-selected', meta.NTIID, null, null);
		});
	}


},function(){

	this.prototype.renderTpl = Ext.DomHelper.markup([
		{
			cls: 'note profile-activity-item',
			cn:[
				{ cls: 'content-callout', cn:[
					{ cls: 'icon' },
					{ cn:[
						{ cls: 'location link'},
						{ cls: 'context', cn: [{tag: 'canvas'},{cls: 'text'}] }
					]}
				]},
				{ cls:'item', cn:[
					{ cls: 'avatar' },
					{ cls: 'controls', cn: [
						{ cls: 'favorite-spacer' },
						{ cls: 'favorite' },
						{ cls: 'like' }
					]},
					{ cls: 'meta', cn: [
						{ cls: 'subject', html: '' },
						{ cls: 'stamp', cn: [
							{tag: 'span', cls: 'name link'},
							{tag: 'span', cls: 'separator', html: ' '},
							{tag: 'span', cls: 'time'},
							{tag: 'span', cls: 'separator', html: ' &middot; '},
							{tag: 'span', cls: 'shared-to link', html: 'Private'}
						]}
					]},
					{ cls: 'body' },
					{
						cls: 'respond',
						cn: [
							{
								cls: 'reply-options',
								cn: [
									{ cls: 'reply', html: 'Reply' },
									{ cls: 'edit', html: 'Edit' },
									{ cls: 'flag', html: 'Report' },
									{ cls: 'delete', html: 'Delete' }
								]
							},
							TemplatesForNotes.getEditorTpl()
						]
					}]
				}
			]
		},{
			id: '{id}-body',
			cls: 'note-replies',
			tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}')
		},{
			cls: 'comments', 'data-label': ' Comments', html: ' '
		}
	]);
});

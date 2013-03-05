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
		spacerEl: '.item-spacer',
		itemEl: '.item',
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

	updateFromRecord: function(){
		this.callParent(arguments);
		this.syncFloatingHeight();
	},

	afterRender: function(){
		this.callParent(arguments);
		if(this.commentsEl.dom){
			this.mon(this.commentsEl, 'click', this.clickedRevealAllReplies,this);
		}
		if(this.replyButton.dom){
			this.mon( this.replyButton, 'click', this.clickedRevealAllReplies, this);
		}
		this.mon( this.deleteEl, 'click', this.onDelete, this);
		this.mon( this.editEl, 'click', this.onEdit, this);
		this.mon( this.flagEl, 'click', this.onFlag, this);
		this.mon( this.contextEl, 'click', this.goToObject, this);
		this.mon( this.spacerEl, 'click', this.goToObject, this);
		this.on( 'reveal-replies', this.clickedRevealAllReplies);

		//NOTE: We run into a case where a reply to one of our replies doesn't trigger opening the reply editor.
		// It was mainly a timing issue, so now listen to add events.
		this.on('add', function(cmp, child){
			if( this.replyToId && child.record && child.record.getId() === this.replyToId){
				Ext.defer(this.maybeOpenReplyEditor, 1, this);
			}
		});
	},

	addAdditionalRecordListeners: function(record){
		this.callParent(arguments);
		this.mon( record, 'convertedToPlaceholder', this.destroy, this);
	},

	removeAdditionalRecordListeners: function(record){
		this.callParent(arguments);
		this.mun( record, 'convertedToPlaceholder', this.destroy, this);
	},

	onBeforeAdd: function(cmp){
		this.callParent(arguments);
		if(!this.isExpanded()){
			if(this.items.last()){
				this.items.last().destroy();
			}
		}
	},

	enableRevealSlide: function(){
		if(this.slideEnabled){return;}
		this.slideEnabled = true;

		var i = this.itemEl, t;

		function min(){
			clearTimeout(t);
			i.addCls('reveal');
		}
		function mout(){
			clearTimeout(t);
			t = setTimeout(function(){
				if(i){ i.removeCls('reveal'); }
			},500);
		}

		this.contextEl.hover(min,mout);
		this.spacerEl.hover(min,mout);

	},

	updateCount: function(){
		if(this.commentsEl){
			var c = this.record.getReplyCount() || 0;
			console.log('count was update to: ', c);
			this.commentsEl.update(c + ' comments');
		}
	},

	clickedRevealAllReplies: function(){
		this.mun( this.replyButton, 'click', this.clickedRevealAllReplies, this);
		if(!this.commentsEl){ return; }
		this.commentsEl.remove();
		delete this.commentsEl;

		this.shouldShowReplies();
	},

	shouldShowReplies: function(){
		this.suspendLayouts();
		this.removeAll();
		this.resumeLayouts();

		Ext.defer(function(){
			Ext.suspendLayouts();
			this.addReplies(this.record.children);
			Ext.resumeLayouts(true);
		}, 1, this);
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


	syncFloatingHeight: function(){
		var h = this.itemEl.getHeight() - 1;//don't let the bottom peek through the floating part.
		this.spacerEl.setHeight(h);
	},


	maybeFillIn: function(){
		var me = this,
			D = Ext.dom.Element.DISPLAY,
			subject,
			loaded = me.loaded,
			onScreen = loaded || (me.el && me.el.first().isOnScreenRelativeTo(Ext.get('profile'),{bottom:1000}));

		if(loaded || !onScreen){return;}

		me.loaded = true;

		me.getItemReplies();

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
			me.flagEl.addCls('last');
		}

		LocationMeta.getMeta(me.record.get('ContainerId'),me.setLocation,me);
		if(me.root){
			me.contextEl.show();
			me.contextEl.mask('Loading...');
			me.loadContext(function(){
				me.contextEl.unmask();
				me.syncFloatingHeight();

				var c = me.context.getHeight(),
					b = me.contextEl.getHeight();

				if(c > b || me.context.select('img').getCount() > 0){
					//me.enableRevealSlide();
				}
			});
		}
	},


	activateReplyEditor: function(){
		this.callParent(arguments);
		this.addCls('has-active-editor');
		Ext.defer(this.syncFloatingHeight,1,this);
	},


	deactivateReplyEditor: function(){
		this.callParent(arguments);
		this.removeCls('has-active-editor');
		Ext.defer(this.syncFloatingHeight,1,this);
	},


	getItemReplies: function(){
		var me = this,
			r = me.record;

		function cb(store, records){
			var count = store.getCount(), rec = null, items;

			//Set comments count
			me.commentsEl.update( count + me.commentsEl.getAttribute('data-label'));
			if(count === 0 || count === 1){
				me.commentsEl.remove();
				delete me.commentsEl;
			}

			//Stash replies on the record
			items = store.getItems();
			if(items.length === 1 && items[0].getId() === me.record.getId()){
				items = (items[0].children||[]).slice();
			}
			else {
				console.warn('There was an unexpected result from the reply store.');
			}
			me.record.children = items;

			//Set the latest direct reply
			store.each(function(r){
				if(!rec || ( (rec.get('CreatedTime') < r.get('CreatedTime')) && (r.get('inReplyTo') === me.record.getId())) ){ rec = r; }
			});

			if(rec){ me.add({record: rec, autoFillInReplies:false}); }
		}

		r.loadReplies(cb,me,undefined,{sortOn: 'CreatedTime', sortOrder: 'descending'});
	},

	setContent: function(){
		var me = this;
		me.callParent(arguments);
		me.noteBody.select('img').on('load',function(){
			me.syncFloatingHeight();
		});
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
			cid;

		//If we are a placholder find a reply to navigate to
		if(!rec || rec.placeholder){
			Ext.Array.each(this.down('[record]'), function(cmp){
				if(cmp.record && !cmp.record.placholder){
					rec = cmp.record;
					return false; //break
				}
				return true;
			});
		}

		cid = rec ? rec.get('ContainerId') : null;

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

		this.locationEl.on('click',
				Ext.bind(this.fireEvent,this,['navigation-selected', meta.NTIID, null, null]));
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
				{ cls:'item-spacer', html: 'Reveal more' },
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
									{ cls: 'flag', html: 'Flag as Inappropriate' },
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

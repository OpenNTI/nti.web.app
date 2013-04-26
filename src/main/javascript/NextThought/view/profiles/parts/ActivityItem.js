Ext.define('NextThought.view.profiles.parts.ActivityItem',{
	extend: 'NextThought.view.annotations.note.Panel',
	requires: [
		'NextThought.mixins.note-feature.GetLatestReply',
		'NextThought.util.Content'
	],
	alias: [
		'widget.profile-activity-item',
		'widget.profile-activity-default-item',
		'widget.profile-activity-note-item'
	],

	mixins: {
		getLatestReply: 'NextThought.mixins.note-feature.GetLatestReply',
		purchasable: 'NextThought.mixins.store-feature.Purchasable'
	},

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
		itemEl: '.item',
		commentsEl: '.comments',
		flagEl: '.foot .flag',
		deleteEl: '.foot .delete',
		contextWrapEl: '.content-callout'
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
	},


	afterRender: function(){
		this.callParent(arguments);

		if(this.commentsEl && this.commentsEl.dom){
			this.mon(this.commentsEl, 'click', this.clickedRevealAllReplies,this);
		}

		if(this.replyButton && this.replyButton.dom){
			this.mon( this.replyButton, 'click', this.clickedRevealAllReplies, this);
		}

		this.mon( this.deleteEl, 'click', this.onDelete, this);
		this.mon( this.contextWrapEl, 'click', this.goToObject, this);
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
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: 'The following action will delete your note',
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
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
		me.deleteEl.setVisibilityMode(D);

		if(isMe(me.record.get('Creator'))){
			me.flagEl.hide();
		}
		else {
			me.deleteEl.hide();
			me.flagEl.addCls('last');
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


	activateReplyEditor: function(){
		this.callParent(arguments);
		this.addCls('has-active-editor');
	},


	deactivateReplyEditor: function(){
		this.callParent(arguments);
		this.removeCls('has-active-editor');
	},


	setContext: function(){
		this.callParent(arguments);
		this.context.select('iframe').remove();
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

		function error(req,resp){
			req = resp.request;
			var el = me.context.up('.content-callout'),
				ntiid = req && req.ntiid,
				s = Ext.getStore('Purchasable'),
				p = s && s.purchasableForContentNTIID(ntiid);

			if(resp.status === 403 && p){
				me.requiresPurchase = true;
				me.purchasable = p;
				el.removeCls('content-callout').addCls('purchase');
				me.needsPurchaseTpl.overwrite(el, p.getData());
				Ext.DomHelper.append(me.getEl(), {
					cls: 'purchasable-mask',
					style: {top: (me.itemEl.getY() - me.el.getY())+'px'}
				});
				return;
			}
			el.remove();
		}


		LocationMeta.getMeta(cid, function(meta){
			metaInfo = meta;
			C.spider(cid,fin,parse,error);
		}, me);
	},


	goToObject: function(){
		var rec = this.record,
			cid;

		//Show purchase window if we're purchase-able
		if(this.requiresPurchase){

			return;
		}

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
							{tag: 'span', cls: 'time'},
							{tag: 'span', cls: 'shared-to link', html: 'Private'}
						]}
					]},
					{ cls: 'body' },
					{
						cls: 'foot',
						cn: [
							{ cls: 'comments', 'data-label': ' Comments', html: ' ' },
							{ cls: 'flag', html: 'Report' },
							{ cls: 'delete', html: 'Delete' }
						]
					}]
				}
			]
		},{
			id: '{id}-body',
			cls: 'note-replies',
			cn:['{%this.renderContainer(out,values)%}']
		},{
			cls: 'respond', cn: {
			cn: [
				{
					cls: 'reply-options',
					cn: [
						{ cls: 'reply', html: 'Add a comment' }
					]
				},
				TemplatesForNotes.getEditorTpl()
			]}
		}
	]);
});





Ext.define('NextThought.view.profiles.parts.ActivityItemReply',{
	extend: 'NextThought.view.annotations.note.Panel',
	requires: ['NextThought.util.Content'],
	alias: 'widget.profile-activity-item-reply',
	defaultType: 'profile-activity-item-reply',

	renderSelectors: {
		noteBody: '.reply',
		avatar: '.avatar',
		editEl: '.reply-options .edit',
		flagEl: '.reply-options .flag',
		deleteEl: '.reply-options .delete'
	},

	afterRender: function(){
		var D = Ext.dom.Element.DISPLAY;
		this.flagEl.setVisibilityMode(D);
		this.editEl.setVisibilityMode(D);
		this.deleteEl.setVisibilityMode(D);

		try{
			if(!this.up('profile-activity-item').isExpanded()){
				this.mon( this.replyButton, 'click', this.shouldRevealReplies, this);
			}
		}
		catch(e){
			console.warn('ActivityItemReply was not in an ActivityItem');
		}

		this.callParent(arguments);
		this.mon( this.deleteEl, 'click', this.onDelete, this);
		this.mon( this.editEl, 'click', this.onEdit, this);
	},

	shouldRevealReplies: function(){
		this.mun( this.replyButton, 'click', this.shouldRevealReplies, this);

		var activityItem = this.up('profile-activity-item');
		if(!activityItem || activityItem.isExpanded()){ return; }
		activityItem.replyToId = this.record.getId();
		activityItem.fireEvent('reveal-replies');
	},

	setRecord: function(){
		this.callParent(arguments);

		if(!this.rendered){return;}

		if(isMe(this.record.get('Creator'))){ this.flagEl.hide(); }
		else {
			this.editEl.hide();
			this.deleteEl.hide();
			this.flagEl.addCls('last');
		}
	}

},function(){

	this.prototype.renderTpl = Ext.DomHelper.markup([{
		cls: 'reply profile-activity-reply-item',
		cn: [
			{ cls: 'avatar' },
			{ cls: 'meta', cn: [
				{ cls: 'controls', cn: [
					{ cls: 'favorite-spacer' },
					{ cls: 'like' }]},
				{ tag: 'span', cls: 'name' },' ',
				{ tag: 'span', cls: 'time' }
			]},
			{ cls: 'body' },
			{ cls: 'respond',
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
			}
		]
	},{
		id: '{id}-body',
		cls: 'note-replies',
		cn:['{%this.renderContainer(out,values)%}']
	}]);
});

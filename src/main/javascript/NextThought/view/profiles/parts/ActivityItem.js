Ext.define('NextThought.view.profiles.parts.ActivityItem',{
	extend: 'NextThought.view.annotations.note.Panel',
	requires: [
		'NextThought.util.Content',
		'NextThought.view.profiles.parts.ActivityItemReply'
	],
	alias: 'widget.profile-activity-item',
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
		commentsEl: '.comments'
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
		this.mon(this.commentsEl, 'click', this.clickedRevealAllReplies,this);
	},


	clickedRevealAllReplies: function(){
		this.commentsEl.remove();
		this.fillInReplies();
	},


	maybeFillIn: function(){
		var me = this,
			count,subject,
			loaded = me.loaded,
			onScreen = loaded || me.el.first().isOnScreenRelativeTo(Ext.get('profile'));

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
		}

		subject = me.record.get('subject');
		me.subjectEl.update(subject||'Subject');
		if(!subject){
			me.subjectEl.addCls('no-subject');
			me.name.addCls('no-subject');
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


	setLocation: function(meta){
		if(!meta){return;}

		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setLocation,this,arguments),this,{single:true});
			return;
		}


		var location, path, iconPath,
			lineage = LocationProvider.getLineage(meta.NTIID,true);

		iconPath = meta.icon;
		if(iconPath.substr(0,meta.root.length) !== meta.root ){
			iconPath = meta.root+meta.icon;
		}

		location = lineage.first();
		path = lineage.last();

		this.locationEl.update(path + '/.../' + location);
		this.locationIcon.setStyle({
			backgroundImage: Ext.String.format('url({0})',meta.baseURI+iconPath)
		});

		this.locationEl.hover(
				function(){Ext.fly(this).addCls('over');},
				function(){Ext.fly(this).removeCls('over');});

		this.locationEl.on('click',function(){
			LocationProvider.setLocation(meta.NTIID);
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
						{ cls: 'context', cn: [{tag: 'canvas'},{tag: 'span', cls: 'text'}] }
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
									{ cls: 'flag', html: 'Report' },
									{ cls: 'mute', html: 'Mute' }
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

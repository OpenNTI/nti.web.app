Ext.define('NextThought.view.profiles.parts.ActivityItem',{
	extend: 'NextThought.view.annotations.note.Panel',
	requires: [
		'NextThought.util.Content',
		'NextThought.view.profiles.parts.ActivityItemReply'
	],
	alias: 'widget.profile-activity-item',
	defaultType: 'profile-activity-item-reply',

	renderSelectors: {
		avatar: '.avatar',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		favoritesSpacer: '.controls .favorite-spacer',
		locationEl: '.location',
		contextEl: '.context',
		subjectEl: '.subject',
		locationIcon: '.icon'
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


	maybeFillIn: function(){
		var me = this,
			loaded = me.loaded,
			onScreen = loaded || me.el.first().isOnScreenRelativeTo(Ext.get('profile'));

		if(loaded || !onScreen){return;}

		me.loaded = true;

		console.debug('Filling in');

		LocationMeta.getMeta(me.record.get('ContainerId'),me.setLocation,me);
		if(me.root){
			me.contextEl.show();
			me.contextEl.mask('Loading...');
			me.loadContext(function(){
				me.contextEl.unmask();
			});
		}
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
						{ cls: 'subject', html: 'Subject' },
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
							TemplatesForNotes.getReplyOptions(),
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
			cls: 'comments', html: '{0} Comments'
		}
	]);
});

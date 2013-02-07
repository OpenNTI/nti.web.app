Ext.define('NextThought.view.profiles.parts.ActivityItem',{
	extend: 'NextThought.view.annotations.note.Panel',
	requires: ['NextThought.util.Content'],
	alias: 'widget.profile-activity-item',
	defaultType: 'profile-activity-item',

	renderSelectors: {
		avatar: '.avatar',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		favoritesSpacer: '.controls .favorite-spacer',
		locationEl: '.meta .subject .location',
		actionEl: '.meta .subject .action',
		contextEl: '.context'
	},

	initComponent: function(){
		if(!this.record || !this.record.isModel){
			Ext.Error.raise('We need a record for this component');
		}
		this.callParent(arguments);
	},


	setRecord: function(record){
		var me = this;
		me.callParent(arguments);
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
			cid = r.get('ContainerId');

		function parse(dom){
			console.debug(dom);
			me.setContext(dom,dom);
		}

		ContentUtils.spider(cid,fin,parse);
	},


	setLocation: function(meta){
		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setLocation,this,arguments),this,{single:true});
			return;
		}
		var map = {
				note : 'commented in',
				highlight: 'highlighted in'
			},
			action = map[this.record.get('Class').toLowerCase()];

		if(this.record.parent){
			action = 'replied in';
		}

		this.actionEl.update(action);
		this.locationEl.update(meta.title.get('title'));
	}


},function(){

	this.prototype.renderTpl = Ext.DomHelper.markup([{
		    cls: 'note profile-activity-item',
		    cn:[
			    { cls: 'avatar' },
			    { cls: 'controls', cn: [
	                { cls: 'favorite-spacer' },
	                { cls: 'favorite' },
	                { cls: 'like' }
	            ]},
	            { cls: 'meta', cn: [
	                { cls: 'subject', cn:[
	                    {tag: 'span', cls: 'name link'}, ' ',
	                    {tag: 'span', cls: 'action'},
	                    {tag: 'span', cls: 'separator', html: ' '},
	                    {tag: 'span', cls: 'location link'}
	                ]},
	                { cls: 'stamp', cn: [
	                    {tag: 'span', cls: 'time'},
	                    {tag: 'span', cls: 'separator', html: ' &middot; '},
	                    {tag: 'span', cls: 'shared-to', html: 'private'}
	                ]}
	            ]},
			    { cls: 'context', cn: [{tag: 'canvas'},{tag: 'span', cls: 'text'}] },
			    { cls: 'body' },
			    {
				    cls: 'respond',
				    cn: [
					    TemplatesForNotes.getReplyOptions(),
					    TemplatesForNotes.getEditorTpl()
				    ]
			    }]
		    },{
			    id: '{id}-body',
			    cls: 'note-replies',
			    tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}')
		    }]);
	});

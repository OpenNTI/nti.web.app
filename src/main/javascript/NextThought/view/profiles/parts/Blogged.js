Ext.define('NextThought.view.profiles.parts.Blogged',{
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-personalblogentry-item',

	ui: 'activity',
	cls: 'blogged-event',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'}},
		{ cls: 'meta', cn:[
			{ cls: 'title', html: '{headline.title}' },
			{ cls: 'counts', cn:[
				{ tag: 'span', cls:'link comment-count', html: '{PostCount} Comments', 'data-target':'comments' },
				{ tag: 'span', cls:'link likes', html: '{LikeCount} Likes' },
				{ tag: 'span', html: '{date}'}
			] }
		]}
	]),

	initComponent: function(){
		this.callParent(arguments);
		this.mon(this.record, 'destroy', this.destroy, this);
	},

	beforeRender: function(){
		var me = this, rd, r = me.record,
			username = me.record.get('Creator');

		me.callParent(arguments);

		rd = me.renderData = Ext.apply(me.renderData||{},r.getData());
		rd.headline = rd.headline.getData();
		rd.date = Ext.Date.format(r.get('headline').get('CreatedTime'),'F j, Y');

		UserRepository.getUser(username, function(u){
			me.user = u;
			rd.avatarURL = u.get('avatarURL');
			rd.name = u.getName();
			if(me.rendered){
				//oops...we resolved later than the render...re-render
				me.renderTpl.overwrite(me.el,rd);
			}
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,'click',this.onClick,this);
		this.record.addObserverForField(this, 'LikeCount', this.likeCountUpdated, this);
		this.record.addObserverForField(this, 'title', this.titleUpdated, this);
		this.record.addObserverForField(this, 'PostCount', this.updatePostCount, this);
	},


	titleUpdated: function(f, v){
		if(this.rendered){
			this.el.down('.title').update(v);
		}
	},


	likeCountUpdated: function(f, v){
		if(this.rendered){
			this.el.down('.likes').update(v+' Likes');
		}
	},


	updatePostCount: function(k, v){
		if(!this.rendered){
			return;
		}

		var el = this.el.down('.comment-count');
		if(el){
			el.update(Ext.String.format('{0} Comment{1}', v, v === 1 ? '' : 's'));
		}
	},


	onClick: function(e){
		var t = e.getTarget('[data-target]'),
			u = this.user, hash,
			postId = this.record.get('ID'),
			args=['Thoughts', postId];

		if(!postId || !Ext.isString(postId)){args.pop();}
		else if(t){ args.push(t.getAttribute('data-target')); }

		hash = u.getProfileUrl.apply(u,args);

		if(location.hash !== hash){
			location.hash = hash;
		}
	}
});

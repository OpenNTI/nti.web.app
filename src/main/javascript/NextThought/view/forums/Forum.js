/**
 * https://docs.google.com/a/nextthought.com/presentation/d/18qyM3011F_AXjwAPGpE-94DPKmuPPPnKQ0EepyAoXmQ/edit#slide=id.gb09172a6_02
 *
 * This will list the contents of the forum. Listing the Topics below it.
 *
 * When a user selects one we will add that view (Topic) onto the stack, suppressing this one. (The stack and impl
 * to be handled in the controller)
 */
Ext.define('NextThought.view.forums.Forum',{
	extend: 'Ext.view.View',
	alias: ['widget.forums-forum','widget.forums-topic-list'],

	mixins: {
		HeaderLock: 'NextThought.view.forums.mixins.HeaderLock',
        ModuleContainer: 'NextThought.mixins.ModuleContainer'
	},

	requires: [
        'NextThought.util.Time',
        'NextThought.modules.TouchSender',
        'NextThought.view.forums.TouchHandler'
    ],

	cls: 'topic-list list',
	itemSelector: '.topic-list-item',
	preserveScrollOnRefresh: true,
	loadMask: false,
//	loadingHeight: 300,

	listeners: {
		select: function(selModel,record){
			//allow reselect since we don't style the selected state, this has no
			// visual effect other than the ability to click on it again
			selModel.deselect(record);
		}
	},

	headerTpl: Ext.DomHelper.createTemplate({
		cls: 'header-container', cn: {
			cls: 'forum-topic-list header', cn:[
				{ cls: 'controls', cn:[
					{ cls: 'new-topic', html: 'New Discussion'}
				] },
				{ cls: 'path', html: '{forumTitle}&nbsp;'}
			]
		}
	}),

	tpl: Ext.DomHelper.markup([
		{ tag: 'tpl', 'for':'.', cn: [
			{ cls: 'topic-list-item', cn: [
				{ cls: 'controls', cn: [
					{ cls: 'favorite {favoriteState}' },
					{ cls: 'like {likeState}', html:'{[values.LikeCount==0?\"\":values.LikeCount]}' }
				]},
				{ cls: 'title', html: '{title}' },
				{ cls: 'meta', cn:[
					{ tag: 'span', cls:'count', html: '{PostCount:plural(parent.kind)}' },
					{ tag: 'tpl', 'if':'!values[\'NewestDescendant\'] || !values[\'NewestDescendant\'].isComment', cn: [
						{ tag: 'span', cls: 'descendant', cn: [
							'Posted by ',{tag: 'span', cls: 'name link', html: '{Creator}'},
							' {[TimeUtils.timeDifference(new Date(),values["CreatedTime"])]}'
						]}
					]},
					{ tag: 'tpl', 'if':'values[\'NewestDescendant\'] && values[\'NewestDescendant\'].isComment', cn: [
						{ tag: 'span', cls: 'descendant', cn: [
							'Commented on by ',{tag: 'span', cls: 'name link', html: '{[values["NewestDescendant"].get("Creator")]}'},
							' {[TimeUtils.timeDifference(new Date(),values["NewestDescendant"].get("CreatedTime"))]}'
						]}
					]}

				]}
			]}
		]}
	]),


	collectData: function(){
		var r = this.callParent(arguments);
		r.kind = 'Comment';
		return r;
	},


	//deferEmptyText: false,
	emptyText: Ext.DomHelper.markup({
		cls: 'empty-forum',
		html: 'Be the first to start a discussion.',
		cn: {cn:[
			{ tag: 'a', html:'Go back', href: '#back'},
			' &middot ',
			{ tag: 'a', html:'New discussion', href: '#'}
		]}
	}),


	initComponent: function(){
		this.mixins.HeaderLock.constructor.call(this);
		this.callParent(arguments);

		this.mon(this.store,{
			scope: this,
			add: this.incrementTopicCount,
			remove: this.decrementTopicCount,
			load: this.updateTopicCount
		});
		this.on('refresh', this.fillInNewestDescendant, this);
	},


	fillInNewestDescendant: function(){
		var map = {}, me = this;
		this.store.each(function(r){
			var desc = r.get('NewestDescendant'),
				creator = desc ? desc.get('Creator') : undefined;

			if(creator && !creator.isModel){
				if(Ext.isArray(map[creator])){
					map[creator].push(r);
				}
				else{
					map[creator] = [r];
				}
			}
		});

		function apply(resolvedUser, i){
			var recs = map[resolvedUser.get('Username')] || [];
			Ext.Array.each(recs, function(rec){
				var desc = rec.get('NewestDescendant'),
					recIdx = -1;
				if(desc){
					desc.set('Creator', resolvedUser);
					//When a field is another model object and one of it's properties change,
					//the containing object won't see the change right now.  One would think
					//you could set back the same field, but since they are equivalent nothing
					//happens.  So, until we have a framework in place for this force this particular
					//node to update.  We wouldn't get here if it wasn't changing anyway
					recIdx = me.store.indexOf(rec);
					if(recIdx >- 0){
						me.refreshNode(recIdx);
					}
				}
			});
		}

		UserRepository.getUser(Ext.Object.getKeys(map),function(users){
			me.store.suspendEvents(true);
			Ext.each(users, apply);
			me.store.resumeEvents();
		});
	},

	itemUpdate: function(record, index, node){
		//this.fillInNewestDescendant();
		var newestDescendant = record.get('NewestDescendant'),
			creator = newestDescendant && newestDescendant.get('Creator'), me = this;

		function resolve(user){
			record.get('NewestDescendant').set('Creator', user);
			if(index >= 0){
				me.refreshNode(index);
			}
		}
		if(creator && !creator.isModel){
			//not an object resolve user
			UserRepository.getUser(creator,resolve);
		}
	},

	afterRender: function(){
		this.callParent(arguments);

		var title = this.record.get('title');
		if( title === 'Forum' ){
			title = this.record.get('Creator')+' / '+title;
		}
		this.path = title;
		this.headerElContainer = this.headerTpl.append(this.el,{ forumTitle: title },true);
		this.headerEl = this.headerElContainer.down('.header');

		if(Ext.isEmpty(this.record.getLink('add'))){
			this.headerEl.down('.new-topic').remove();
			this.emptyText = Ext.DomHelper.markup({
				cls: 'empty-forum',
				html: 'No discussions available.',
				cn: {cn:[ { tag: 'a', html:'Go back', href: '#back'} ]}
			});
		}

		this.mon(this.headerEl,'click','onHeaderClick');

		this.on({
			'activate':'onActivate',
			'itemupdate':'itemUpdate'
		});

        if(Ext.is.iPad){
            this.buildModule('modules', 'touchSender');
            this.buildModule('forums', 'touchHandler', {topics:true});
        }
	},


	incrementTopicCount: function(store, record){
		this.record.set({'TopicCount': (store.totalCount + 1)});
	},

	decrementTopicCount: function(store, record){
		this.record.set({'TopicCount': (store.totalCount - 1)});
	},

	updateTopicCount: function(store, record){
		//Make sure we're in sync with the store.
		if(this.record.get('TopicCount') !== store.totalCount){
			this.record.set({'TopicCount': store.totalCount});
		}
	},


	getPath: function(){
		var p = this.path,
			o = this.ownerCt,
			l = o && o.getLayout(),
			items, index, c;

		if(l){
			items = l.getLayoutItems();
            index = Ext.Array.indexOf(items, this);
			c = items[index-1];
			c = c && c.getPath && c.getPath();
		}

		return c ? [c, p].join(' / '): p;
	},



	onActivate: function(){
		console.log('The forum view is activated');
		this.store.load();
	},


	onHeaderClick: function(e){
		if(e.getTarget('.path')){
			this.fireEvent('pop-view', this);
		}
		else if(e.getTarget('.new-topic')){
			this.fireEvent('new-topic');
		}
	},


	onContainerClick: function(e){
		var t = e.getTarget('a[href^=#]');
		if(t){
			e.stopEvent();
			if(/#back$/i.test(t.href)){
				history.go(-1);
			}
			else {
				this.fireEvent('new-topic');
			}
		}
		return !t;
	},


	onItemClick: function(record,dom,index,event){
		if(event.getTarget('.controls')){
			event.stopEvent();
			if(event.getTarget('.favorite')){
				record.favorite();
			}
			else if(event.getTarget('.like')){
				record.like();
			}
			return false;
		}

		return true;
	},

	onBeforeItemClick: function(record, item, idx, event, opts){
		var t = event && event.getTarget && event.getTarget(),
			d = record.get && record.get('NewestDescendant'),
			topicHref;

		function isDescendantClick(tar){
			if(!tar){
				return false;
			}

			var target = Ext.fly(tar),
				sel = '.descendant';

			return target.is(sel) || target.parent(sel, true);
		}

		if(d && t && isDescendantClick(t)){
			this.fireEvent('show-topic', record, d.get('ID'));
			return false;
		}
	}
});

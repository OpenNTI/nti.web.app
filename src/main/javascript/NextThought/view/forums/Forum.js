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

	requires: [ 'NextThought.util.Time' ],

	cls: 'topic-list',
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
					{ tag: 'span', cls:'count', html: '{PostCount} Comments' },
					{ tag: 'span', cn: [
						'Posted by ',{tag: 'span', cls: 'name link', html: '{Creator}'},
						' {[TimeUtils.timeDifference(new Date(),values["CreatedTime"])]}'
					]}
				]}
			]}
		]}
	]),


	afterRender: function(){
		this.callParent(arguments);

		var title = this.record.get('title');
		if( title === 'Forum' ){
			title = this.record.get('Creator')+' / '+title;
		}
		this.path = title;
		this.headerElContainer = this.headerTpl.append(this.el,{ forumTitle: title },true);
		this.headerEl = this.headerElContainer.down('.header');

		this.mon(this.headerEl,'click',this.onHeaderClick,this);
		this.on('destroy', this.destroy, this);
		this.on('beforedeactivate', this.onBeforeDeactivate, this);
		this.on('beforeactivate', this.onBeforeActivate, this);
		this.mon(Ext.get('forums'),'scroll', this.handleScrollHeaderLock, this);
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
			c = c && c.getpath && c.getPath();
		}

		return c ? [c, p].join(' / '): p;
	},


	destroy:function(){
		this.headerEl.remove();//make sure we remove this just in case its not in our components element.
		return this.callParent(arguments);
	},

	onBeforeDeactivate: function(){
		if(this.isVisible() && this.headerLocked){
			this.headerEl.insertBefore(this.el.first());
		}
		return true;
	},

	onBeforeActivate: function(){
		var parentDom, forumDom;
		if(this.isVisible() && this.headerLocked && this.headerEl){
			forumDom = this.el.up('.forums-view');
			parentDom = forumDom ? forumDom.dom.parentNode : forumDom.dom;
			this.headerEl.appendTo(parentDom);
		}
	},

	handleScrollHeaderLock: function(e,forumDom){
		var headerEl = this.headerEl,
			domParent = forumDom && forumDom.parentNode,
			scroll = Ext.fly(forumDom).getScroll().top,
			parent = headerEl && Ext.getDom(headerEl).parentNode,
			cutoff = 0,
			cls = 'scroll-pos-right';

		if(!headerEl || !parent){
			console.error('Nothing to handle, el is falsey');
			return;
		}

		if(parent === domParent && (scroll <= cutoff || !this.isVisible())){
			headerEl.removeCls(cls).appendTo(this.headerElContainer);
			delete this.headerLocked;
		}
		else if(this.isVisible() && parent !== domParent && scroll > cutoff){
			headerEl.addCls(cls).appendTo(domParent);
			this.headerLocked = true;
		}
	},


	onHeaderClick: function(e){
		if(e.getTarget('.path')){
			this.fireEvent('pop-view', this);
		}
		else if(e.getTarget('.new-topic')){
			this.fireEvent('new-topic');
		}
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
	}
});

/**
 * https://docs.google.com/a/nextthought.com/presentation/d/18qyM3011F_AXjwAPGpE-94DPKmuPPPnKQ0EepyAoXmQ/edit#slide=id.g9418ebe4_053
 *
 *
 * This will contain a list of Forums.
 *
 * When a user selects one we will add that view (Forum) onto the stack, suppressing this one. (The stack and impl
 * to be handled in the controller)
 */
Ext.define('NextThought.view.forums.Board',{
	extend: 'Ext.view.View',
	alias: ['widget.forums-board','widget.forums-forum-list'],

	requires: [ 'NextThought.util.Time' ],

	cls: 'forum-list',
	itemSelector: '.forum-list-item',

	listeners: {
		select: function(selModel,record){
			//allow reselect since we don't style the selected state, this has no
			// visual effect other than the ability to click on it again
			selModel.deselect(record);
		}
	},

	headerTpl: Ext.DomHelper.createTemplate({
		cls: 'header-container', cn: {
			cls: 'forum-forum-list header', cn:[
				{ cls: 'path', cn:['{path} / ',{tag:'span',cls:'title-part', html:'{title}'}]}
			]
		}
	}),

	tpl: Ext.DomHelper.markup({
		tag: 'tpl', 'for':'.', cn: [
			{ cls: 'forum-list-item', cn: [
				{ tag: 'tpl', 'if':'title == \'Forum\'', cn: { cls: 'title', html: '{Creator} / {title}' } },
				{ tag: 'tpl', 'if':'title != \'Forum\'', cn: { cls: 'title', html: '{title}' } },
				{ tag: 'tpl', 'if':'description', cn: { cls: 'description', html: '{description}'} },
				{ cls: 'meta', cn:[
					{ tag: 'span', cls:'count', html: '{TopicCount} Discussions' },

					//{ tag: 'tpl', 'if':'CommentCount', cn: { tag: 'span', cls:'count', html: '{CommentCount} Comments' }},
					{ tag: 'tpl', 'if':'!values[\'NewestDescendant\']', cn: [
						{ tag: 'span', html: 'Created {[TimeUtils.timeDifference(new Date(),values["CreatedTime"])]}'}
					]},
					{ tag: 'tpl', 'if':'values[\'NewestDescendant\']', cn: [
						{ tag: 'span', html: 'Last Active {[TimeUtils.timeDifference(new Date(),values["Last Modified"])]}'}
					]}
				]}
			]}
		]
	}),

	afterRender: function(){
		this.callParent(arguments);

		if(!this.isRoot){
			this.headerElContainer = this.headerTpl.append(this.el,{ path: this.record.get('Creator'), title: this.record.get('title') },true);
			this.headerEl = this.headerElContainer.down('.header');
			this.mon(this.headerEl,'click',this.onHeaderClick,this);
			this.on('beforedeactivate', this.onBeforeDeactivate, this);
			this.on('beforeactivate', this.onBeforeActivate, this);
			this.on('activate', this.onActivate, this);
			this.mon(Ext.get('forums'),'scroll', this.handleScrollHeaderLock, this);
		}
	},

	onDestroy: function(){
		this.headerEl.remove();
		return this.callParent(arguments);
	},

	onBeforeDeactivate: function(){
		if(this.isVisible() && this.headerLocked){
			this.headerEl.appendTo(this.headerElContainer);
		}
	},


	onActivate: function(){
		//console.log('The board view is activated');
		this.store.load();
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

		if(this.isVisible() && (!headerEl || !parent)){
			console.error('Nothing to handle, el is falsey');
			return;
		}

		if(parent === domParent && (scroll <= cutoff || !this.isVisible())){
			headerEl.removeCls(cls).appendTo(this.headerElContainer);
			delete this.headerLocked;
		}
		else if(this.isVisible() && parent !== domParent && scroll > cutoff){
			this.headerLocked = true;
			headerEl.addCls(cls).appendTo(domParent);
		}
	},


	onHeaderClick: function(e){
		if(e.getTarget('.path')){
			this.fireEvent('pop-view', this);
		}
	}
});

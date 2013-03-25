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
			cls: 'header', cn:[
				{ cls: 'path', html: '{forumTitle} &nbsp;'}
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
					{ tag: 'tpl', 'if':'values[\'Last Modified\'] &lt; 1', cn: [
						{ tag: 'span', html: 'Created {[TimeUtils.timeDifference(new Date(),values["CreatedTime"])]}'}
					]},
					{ tag: 'tpl', 'if':'values[\'Last Modified\'] &gt; 0', cn: [
						{ tag: 'span', html: 'Last Active {[TimeUtils.timeDifference(new Date(),values["Last Modified"])]}'}
					]}
				]}
			]}
		]
	}),

	afterRender: function(){
		this.callParent(arguments);
		this.headerElContainer = this.headerTpl.append(this.el,{ forumTitle: this.record.get('Creator') +' / '+ this.record.get('title') },true);
		this.headerEl = this.headerElContainer.down('.header');
		this.mon(Ext.get('forums'),'scroll', this.handleScrollHeaderLock, this);
	},


	handleScrollHeaderLock: function(e,forumDom){
		var headerEl = this.headerEl,
			domParent = forumDom && forumDom.parentNode,
			scroll = Ext.fly(forumDom).getScroll().top,
			parent = headerEl && Ext.getDom(headerEl).parentNode,
			cutoff = 0;

		if(!headerEl || !parent){
			console.error('Nothing to handle, el is falsey');
			return;
		}

		if(parent === domParent && (scroll <= cutoff || !this.isVisible())){
			headerEl.appendTo(this.headerElContainer);
		}
		else if(this.isVisible() && parent !== domParent && scroll > cutoff){
			headerEl.appendTo(domParent);
		}
	},


	onContainerClick: function(e){
		if(e.getTarget('.path')){
			this.fireEvent('pop-view', this);
		}
	}
});

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

	listeners: {
		select: function(selModel,record){
			//allow reselect since we don't style the selected state, this has no
			// visual effect other than the ability to click on it again
			selModel.deselect(record);
		}
	},

	tpl: Ext.DomHelper.markup([
		{ cls: 'header-container', cn: {
			cls: 'header', cn:[
			{ cls: 'controls', cn:[
				{ cls: 'new-topic', html: 'New Discussion'}
			] },
			{ cls: 'path', html: '{forumTitle}'}
		]}},
		{ tag: 'tpl', 'for':'.', cn: [
			{ cls: 'topic-list-item', cn: [
				{ tag: 'tpl', 'if':'title == \'Forum\'', cn: { cls: 'title', html: '{Creator} / {title}' } },
				{ tag: 'tpl', 'if':'title != \'Forum\'', cn: { cls: 'title', html: '{title}' } },
				{ tag: 'tpl', 'if':'description', cn: { cls: 'description', html: '{description}'} },
				{ cls: 'meta', cn:[
					{ tag: 'span', cls:'count', html: '{TopicCount} Discussions' },
					//Aaron's design has an aggregate comment(post) count for the entire forum at the list level...
					// I'm just putting the field in the template for shits and giggles. It won't show up unless this
					// value is populated.
					{ tag: 'tpl', 'if':'CommentCount', cn: { tag: 'span', cls:'count', html: '{CommentCount} Comments' }},

					{ tag: 'span', html: 'Last Active {[TimeUtils.timeDifference(new Date(),values["Last Modified"])]}'}
				]}
			]}
		]}
	])
});

/**
 * https://docs.google.com/a/nextthought.com/presentation/d/18qyM3011F_AXjwAPGpE-94DPKmuPPPnKQ0EepyAoXmQ/edit#slide=id.g9418ebe4_053
 *
 * I'm not sure there will be a visual component mapping to a list of boards. I think we will simply list the
 * contents of all viewable boards as a flat list of Forums. So this container will be nearly symbolic to its
 * relation to the models.
 *
 * This will contain a flattened list of Forums.
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

	tpl: Ext.DomHelper.markup({
		tag: 'tpl', 'for':'.', cn: [
			{ cls: 'forum-list-item', cn: [
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
		]
	})
});

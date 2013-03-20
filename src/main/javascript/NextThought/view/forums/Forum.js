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

	itemSelector: '.item',

	tpl: Ext.DomHelper.markup([
		{ cls: 'heading' },//put path and controls here. This will need to be scroll locked
		{ tag: 'tpl', 'for':'.', cn: [
			{ cls: 'item', html: '{title}'}
		]}
	])
});

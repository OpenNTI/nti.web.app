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
			{ cls: 'path', html: '{forumTitle}Path'}
		]}},
		{ tag: 'tpl', 'for':'.', cn: [
			{ cls: 'topic-list-item', cn: [
				{ cls: 'controls', cn: [
					{ cls: 'favorite {favoriteState}' },
					{ cls: 'like {likeState}' }
				]},
				{ cls: 'title', html: '{title}' },
				{ cls: 'meta', cn:[
					{ tag: 'span', cls:'count', html: '{PostCount} Comments' },
					{ tag: 'span', cn: [
						'Posted by ',{tag: 'span', cls: 'name link', html: '{Creator}'},
						' {[TimeUtils.timeDifference(new Date(),values["Last Modified"])]}'
					]}
				]}
			]}
		]}
	]),


	onContainerClick: function(e){
		if(e.getTarget('.path')){
			this.destroy();
		}
		else if(e.getTarget('.new-topic')){
			console.log('new topic!');
		}
	},


	onItemClick: function(record,dom,index,event){
		console.log('item click', arguments);
	}
});

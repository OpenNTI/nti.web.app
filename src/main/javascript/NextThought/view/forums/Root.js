/**
 * This will contain a list of Boards.
 *
 */
Ext.define('NextThought.view.forums.Root',{
	extend: 'Ext.view.View',
	alias: ['widget.forums-root','widget.forums-board-list'],

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

	tpl: Ext.DomHelper.markup({
		tag: 'tpl', 'for':'.', cn: [
			{ cls: 'forum-list-item', cn: [
				{ cls: 'title', html: '{Creator}' },
				{ tag: 'tpl', 'if':'description', cn: { cls: 'description', html: '{description}'} },
				{ cls: 'meta', cn:[
					{ tag: 'span', cls:'count', html: '{ForumCount} {parent.kind:plurality(values.PostCount)}' }
				]}
			]}
		]
	}),

	collectData: function(){
		var r = this.callParent(arguments);
		r.kind = 'Forum';
		return r;
	}

});

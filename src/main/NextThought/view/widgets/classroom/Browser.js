/**
 * @class NextThought.view.widgets.classroom.Chooser
 * @extends Ext.view.View
 */
Ext.define('NextThought.view.widgets.classroom.Browser', {
    extend: 'Ext.view.View',
    alias: 'widget.classroom.browser',

	singleSelect: true,
	autoScroll  : true,
    overItemCls: 'x-item-over',
    itemSelector: 'div.item-wrap',
    tpl: [
        '<div class="classroom-browser">',
            '<tpl for=".">',
                '<div class="item-wrap">',
                    '<div class="item">',
						'<img src="{avatarURL}" width=22 height=22"/>',
						'<div>',
							'<div class="selector"><a href="#">Select</a></div>',
							'<span class="name">{realname}</span>',
						'</div>',
                    '</div>',
                '</div>',
            '</tpl>',
        '</div>'
    ],

    initComponent: function() {
        this.store = UserDataLoader.getFriendsListsStore();
        this.callParent(arguments);
        //this.store.sort();
    }
});

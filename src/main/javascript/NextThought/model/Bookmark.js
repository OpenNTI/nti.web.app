Ext.define('NextThought.model.Bookmark', {
    extend: 'NextThought.model.Base',

    isBookmark: true,

    requires: [
        'NextThought.model.anchorables.DomContentRangeDescription',
        'NextThought.model.converters.ContentRangeDescription'
    ],

    fields: [
        { name: 'sharedWith', type: 'UserList'},
        { name: 'prohibitReSharing', type: 'boolean' },
        { name: 'AutoTags', type: 'Auto'},
        { name: 'tags', type: 'Auto'},
        { name: 'selectedText', type: 'string'},
        { name: 'applicableRange', type: 'ContentRangeDescription'},

        { name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'},
	    { name: 'FavoriteGroupingField', defaultValue:'Bookmarks', persist: false}

    ]
});

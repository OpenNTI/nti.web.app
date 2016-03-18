var Ext = require('extjs');
var ModelBase = require('./Base');
var AnchorablesDomContentRangeDescription = require('./anchorables/DomContentRangeDescription');
var ConvertersContentRangeDescription = require('./converters/ContentRangeDescription');


module.exports = exports = Ext.define('NextThought.model.Bookmark', {
  extend: 'NextThought.model.Base',
  isBookmark: true,

  fields: [
    { name: 'sharedWith', type: 'UserList'},
    { name: 'prohibitReSharing', type: 'boolean' },
    { name: 'AutoTags', type: 'Auto'},
    { name: 'tags', type: 'Auto'},
    { name: 'selectedText', type: 'string'},
    { name: 'applicableRange', type: 'ContentRangeDescription'},

    { name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'},
    { name: 'NotificationGroupingField', mapping: 'CreatedTime', type: 'groupByTime', persist: false, affectedBy: 'CreatedTime'},
	  { name: 'FavoriteGroupingField', defaultValue: 'Bookmarks', persist: false}

  ]
});

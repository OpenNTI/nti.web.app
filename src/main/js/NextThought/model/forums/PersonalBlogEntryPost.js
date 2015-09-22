Ext.define('NextThought.model.forums.PersonalBlogEntryPost', {
	extend: 'NextThought.model.forums.HeadlinePost',

	fields: [
		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'},
		{ name: 'NotificationGroupingField', mapping: 'CreatedTime', type: 'groupByTime', persist: false, affectedBy: 'CreatedTime'}
	]
});

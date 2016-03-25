var Ext = require('extjs');
var ForumsHeadlineTopic = require('./HeadlineTopic');
var MixinsModelWithPublish = require('../../mixins/ModelWithPublish');
var {isMe} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.model.forums.PersonalBlogEntry', {
	extend: 'NextThought.model.forums.HeadlineTopic',

	isBlogEntry: true,

	mixins: {
		publishActions: 'NextThought.mixins.ModelWithPublish'
	},

	fields: [
		{ name: 'FavoriteGroupingField', defaultValue: 'Thoughts', persist: false},
		{ name: 'sharedWith', type: 'UserList' }
	],

	getActivityLabel: function () {
		return 'shared a thought:';
	},

	//TODO: workaround for no-edit link
	isModifiable: function () {
		return isMe(this.get('Creator'));
	}

});



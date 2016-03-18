var Ext = require('extjs');
var ForumsHeadlineTopic = require('./HeadlineTopic');
var MixinsModelWithPublish = require('../../mixins/ModelWithPublish');


module.exports = exports = Ext.define('NextThought.model.forums.CommunityHeadlineTopic', {
	extend: 'NextThought.model.forums.HeadlineTopic',

	mixins: {
		publishActions: 'NextThought.mixins.ModelWithPublish'
	}
});

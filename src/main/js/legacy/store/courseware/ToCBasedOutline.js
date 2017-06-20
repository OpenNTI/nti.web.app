const Ext = require('extjs');

require('legacy/model/courses/navigation/Node');


module.exports = exports = Ext.define('NextThought.store.courseware.ToCBasedOutline', {
	extend: 'Ext.data.Store',
	model: 'NextThought.model.courses.navigation.Node'
});

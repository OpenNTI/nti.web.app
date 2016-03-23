var Ext = require('extjs');
var NavigationNode = require('../../model/courses/navigation/Node');


module.exports = exports = Ext.define('NextThought.store.courseware.ToCBasedOutline', {
	extend: 'Ext.data.Store',
	model: 'NextThought.model.courses.navigation.Node'
});

const Ext = require('extjs');

require('./RelatedWork');


module.exports = exports = Ext.define('NextThought.model.AssignmentRef', {
	extend: 'NextThought.model.RelatedWork',

	isAssignmentRef: true,


	getAssignmentId () {
		return this.get('Target-NTIID');
	}
});

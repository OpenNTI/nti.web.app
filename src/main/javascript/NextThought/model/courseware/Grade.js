Ext.define('NextThought.model.courseware.Grade', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Username', type: 'string'},
		{name: 'value', type: 'string', convert: function(v) {
			var n;
			if (typeof v === 'number') {
				n = v.toFixed(1);
				if (n.split('.')[1] === '0') {
					n = v.toFixed(0);
				}
				v = n;
			}

			return v;
		}},
		{name: 'AssignmentId', type: 'string'}
	]
});

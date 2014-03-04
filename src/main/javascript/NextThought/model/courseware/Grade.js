Ext.define('NextThought.model.courseware.Grade', {
	extend: 'NextThought.model.Base',

	mimeType: 'application/vnd.nextthought.grade',
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
	],


	save: function(config) {

		function failed() {
			Ext.MessageBox.alert({
				title: 'Error',
				msg: 'There was an error saving the grade value.',
				icon: 'warning-red',
				buttonText: true,
				buttons: {
					ok: 'Ok'
				}
			});
		}

		config.failure = Ext.Function.createSequence(config.failure || Ext.emptyFn, failed, null);

		return this.callParent(arguments);
	}
});

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
		{name: 'AssignmentId', type: 'string'},
		{name: 'assignmentName', type: 'string', persist: false},
		{name: 'assignmentContainer', type: 'string', persist: false}
	],

	/**
	 * Check if the value is empty, need to handle
	 * "# L", "# -", " L", " " -", "#", and ""
	 * @return {Boolean}
	 */
	isEmpty: function() {
		var val = this.get('value');

		return Ext.isEmpty(val.replace('-', '').trim());
	},

	//Doesn't make sense for this object
	isMine: function() {
		return true;
	},


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

		if (this.isEmpty()) {
			this.destroy(config);
			return;
		}

		return this.callParent(arguments);
	}
});

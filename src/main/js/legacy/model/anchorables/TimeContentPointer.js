const Ext = require('@nti/extjs');

require('./ContentPointer');

const TimeContentPointer =
	(module.exports =
	exports =
		Ext.define('NextThought.model.anchorables.TimeContentPointer', {
			extend: 'NextThought.model.anchorables.ContentPointer',

			config: {
				role: '',
				seconds: '',
			},

			validRoles: ['start', 'end'],

			statics: {
				createFromObject: function (o) {
					return TimeContentPointer.create({
						role: o.role,
						seconds: parseInt(o.seconds, 10),
					});
				},
			},

			constructor: function (config) {
				this.validateRole(config.role);
				this.callParent(arguments);
				this.Class = 'TimeContentPointer';
			},

			validateRole: function (r) {
				if (!r) {
					Ext.Error.raise('Must supply a role');
				} else if (!Ext.Array.contains(this.validRoles, r)) {
					Ext.Error.raise(
						'Role must be of the value ' +
							this.validRoles.join(',') +
							', supplied ' +
							r
					);
				}
			},
		}));

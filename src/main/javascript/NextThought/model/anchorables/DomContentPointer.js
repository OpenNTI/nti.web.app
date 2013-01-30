Ext.define('NextThought.model.anchorables.DomContentPointer', {
	extend: 'NextThought.model.anchorables.ContentPointer',

	config: {
		role: ''
	},
	validRoles: [
		'start',
		'end',
		'ancestor'
	],

	statics: {
		createFromObject: function(o){
			return NextThought.model.anchorables.DomContentPointer.create({
				role: o.role
			});
		}
	},

	constructor: function(o){
		this.validateRole(o.role);
		var r = this.callParent(arguments);
		this.Class = 'DomContentPointer';
		return r;
	},



	validateRole: function(r) {
		if (!r) {
			Ext.Error.raise('Must supply a role');
		}
		else if (!Ext.Array.contains(this.validRoles, r)){
			Ext.Error.raise('Role must be of the value ' + this.validRoles.join(',') + ', supplied ' + r);
		}
	},


	locateRangePointInAncestor: function(){
		return {confidence: 0, node: null};
	}
});

Ext.define('NextThought.model.Course', {
	extend: 'NextThought.model.Base',

	requires: [

	],

	fields: [
		{ name: 'Activated', type: 'bool', persist: false },
		{ name: 'Amount', type: 'float', persist: false },
		{ name: 'Currency', type: 'string', persist: false },
		{ name: 'BulkPurchase', type: 'bool', persist: false },
		{ name: 'Discountable', type: 'bool', persist: false },
		{ name: 'Provider', type: 'string', persist: false },
		{ name: 'Title', type: 'string', persist: false },
		{ name: 'Icon', type: 'string', persist: false },
		{ name: 'Description', type: 'string', persist: false },
		{ name: 'StripeConnectKey', type: 'singleitem', persist: false },
		{ name: 'Items', type: 'auto', persist: false },
		{ name: 'isCourse', type:'bool', persist: false, defaultValue:false },
		{ name: 'courseName', type:'string', persist: false, defaultValue:'' },
		{ name: 'HasHistory', type: 'bool', persist: false, affectedBy: 'Last Modified', convert: function(v,r){
			return r && r.hasHistory();
		}}
	],

	isCourse: true,

	hasHistory: function(){
		return Boolean(this.getLink('history'));
	}
});

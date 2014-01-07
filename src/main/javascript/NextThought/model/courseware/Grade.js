Ext.define('NextThought.model.courseware.Grade', function(){
	var observer = new Ext.util.Observable();
	
	return {
		extend: 'NextThought.model.Base',

		fields: [
			{name: 'Username', type: 'string'},
			{name: 'value', type: 'string'},
			{name: 'AssignmentId', type: 'string'}
		],

		constructor: function(){
			this.callParent(arguments);
			var me = this;
			//TODO: Find a better way than doing this
			me.on('value-changed', function(key, value){
				observer.fireEvent('grade-value-changed', value, me.get('AssignmentId'), me.get('Username'), me);
			});

			observer.on('grade-value-changed', function(value, id, username, rec){
				if(rec === me){
					return;
				}

				if(id === me.get('AssignmentId') && username === me.get('Username')){
					me.set('value', value);
				}
			});
		}
	};
});

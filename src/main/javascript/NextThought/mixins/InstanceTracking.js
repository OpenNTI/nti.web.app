Ext.define('NextThought.mixins.InstanceTracking',{

	trackThis: function(){
		if(!this.isComponent){
			Ext.Error.raise('Must be mixed into a component!');
		}

		var me = this, self = this.self;

		self.instances = self.instances || [];

		self.instances.push(me);

		me.on('destroy',function(){ Ext.Array.remove(self.instances,me); });
	},


	getInstances: function(){
		return (this.self.instances || []).slice();
	}

});

Ext.define('NextThought.mixins.ForumTopicLinks', {

	constructor: function(){

		function onAfterRender(){
			var me = this;
			if(me.el){
				me.mon(me.el,'click', me.clickHandler, me);
			}
		}

		this.on('afterrender', onAfterRender, this, {single:true});
	},

	clickHandler: function(){
		if(this.fireEvent('before-show-topic', this.record)){
			this.fireEvent('show-topic', this.record);
		}
	}
});
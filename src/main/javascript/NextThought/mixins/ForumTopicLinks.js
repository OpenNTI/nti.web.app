Ext.define('NextThought.mixins.ForumTopicLinks', {

	constructor: function(){

		function onAfterRender(){
			var me = this;
			if(me.el){
				me.mon(me.el,'click', me.forumClickHandler, me);
			}
		}

		this.on('afterrender', onAfterRender, this, {single:true});
	},


	forumClickHandler: function(){
		if(this.fireEvent('before-show-topic', this.record)){
			this.fireEvent('show-topic', this.record);
		}
	},


	forumClickHandlerGoToComment: function(){
		if(this.fireEvent('before-show-topic', this.record)){
			this.fireEvent('show-topic', this.record, this.record);
		}
	},


	forumClickHandlerGoToComments: function(){
		if(this.fireEvent('before-show-topic', this.record)){
			this.fireEvent('show-topic', this.record, true);
		}
	}
});

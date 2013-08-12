Ext.define('NextThought.model.forums.CommunityBoard',{
	extend:'NextThought.model.forums.Board',

	fields: [
		{name:'title', type:'auto', persist:false}
	],

	getRelatedCourse: function(){
		return this.course || this.findCourse();
	},

	belongsToCourse: function(){
		return !!this.getRelatedCourse();
	},

	findCourse: function(){
		var me = this;

		Library.courseStore.each(function(title){
			if(me.getId() == title.getBoard()){
				me.course = title;
			}
		});

		return me.course || null;
	}
});

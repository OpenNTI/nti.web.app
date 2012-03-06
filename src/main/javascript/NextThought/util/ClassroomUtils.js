Ext.define('NextThought.util.ClassroomUtils',{
	alternateClassName: 'ClassroomUtils',

	singleton: true,

	requires: [
	],

	isClassroomId: function(id)
	{
		return (/meetingroom/i).test(id);
	},

	getNameFromHref: function(href) {
		return href.split('?')[0].split('/').pop();
	}

},
function(){
	window.ClassroomUtils = this;
});

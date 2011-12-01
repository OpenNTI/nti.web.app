Ext.define('NextThought.util.Classroom',{
    alternateClassName: 'ClassroomUtils',

    singleton: true,

	requires: [
	],

    isClassroomId: function(id)
    {
        return /meetingroom/i.test(id);
    }

},
function(){
    window.ClassroomUtils = this;
});

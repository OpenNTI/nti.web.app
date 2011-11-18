Ext.define('NextThought.util.Classroom',{
    alternateClassName: 'ClassroomUtils',
	requires: [
	],
	statics: {
        isClassroomId: function(id)
        {
            return /meetingroom/i.test(id);
        }
    }
});

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
	},


	isRoomEmpty: function(roomInfo) {
		var occs = roomInfo.get('Occupants');
		if (!occs
			|| occs.length === 0
			|| (occs.length === 1 && occs[0] === $AppConfig.username)) {
			return true;
		}
		return false;
	},


	generateOccupantsString: function(roomInfo) {
		var occs = roomInfo.get('Occupants'),
			numOccs = occs.length,
			result = [],
			max = 2,
			left,
			i,u;

		if (ClassroomUtils.isRoomEmpty(roomInfo)) {
			return 'Nobody';
		}

		for (i = 0; result.length<max && i < numOccs; i++) {
			u =  NextThought.cache.UserRepository.getUser(occs[i]);

			if (u.getId() === $AppConfig.userObject.getId()){continue;}

			result.push(u.get('alias') || u.get('Username'));
		}
		left = occs.length - result.length - 1;

		return result.join(',')+(left ? '...' : '');
	}

},
function(){
	window.ClassroomUtils = this;
});

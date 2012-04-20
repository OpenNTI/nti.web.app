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


	getRoomInfoFromComponent: function(c){
		if (!c) {
			console.error('Cannot get RoomInfo from an undefined component.');
			return null;
		}

		if (c.roomInfo) {
			return c.roomInfo;
		}

		var o = c.up('[roomInfo]');

		if (!o) {
			console.error('The component', c, 'has no parent component with a roomInfo');
			return null;
		}

		return o.roomInfo;
	},


	/**
	 * Convinience for getting the id from the roominfo of a parent component so
	 * individual classes don't have to check existance of the parent component.
	 *
	 * @param c
	 * @return {*}
	 */
	getRoomInfoIdFromComponent: function(c) {
		var o = ClassroomUtils.getRoomInfoFromComponent(c);
		if (o) {
			return o.getId();
		}
		return null;
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
	},


	getClassSectionNameFromRoomInfo: function(roomInfo, nameIfNotFound) {
		var name = null, friendslist;
		Ext.getStore('Providers').findBy(
			function(r, id){
				var sections = r.get('Sections'),
					section, key;
				for (key in sections) {
					if (sections.hasOwnProperty(key)){
						section = sections[key];
						if (section.getId() === roomInfo.get('ContainerId')){
							name = r.get('ID') + ' - ' + section.get('ID');
						}
					}
				}
			}
		);
		if (!name) {
			//Okay, not a class, try friends lists
			friendslist = Ext.getStore('FriendsList').getById(roomInfo.get('ContainerId'));
			if (friendslist){name = friendslist.get('realname');}
		}
		return name || nameIfNotFound;
	}

},
function(){
	window.ClassroomUtils = this;
});

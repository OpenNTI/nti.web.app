Ext.define('NextThought.util.Classrooms',{
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


	getClassSectionNameFromRoomInfo: function(roomInfo, nameIfNotFound) {
		var name = null, friendslist;
		Ext.getStore('Providers').findBy(
			function(r, id){
				var sections = r.get('Sections'),
					section, key;
				for (key in sections) {
					if (sections.hasOwnProperty(key)){
						section = sections[key];
						console.log(section, section.getId(), roomInfo.get('ContainerId'));
						if (section.get('NTIID') === roomInfo.get('ContainerId')){
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
	},


	getClassSectionNameFromSectionId: function(sectionOid) {
		var name = null, friendslist;
		Ext.getStore('Providers').findBy(
			function(r){
				var sections = r.get('Sections'),
					section, key;
				for (key in sections) {
					if (sections.hasOwnProperty(key)){
						section = sections[key];
						if (section.getId() === sectionOid){
							name = r.get('ID') + ' - ' + section.get('ID');
						}
					}
				}
			}
		);

		return name;
	}




},
function(){
	window.ClassroomUtils = this;
});

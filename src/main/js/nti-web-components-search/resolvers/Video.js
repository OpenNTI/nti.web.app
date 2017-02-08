export default {
	handles : {
		'...video': true
	},

	getContainerID (hit, obj) {
		if (!obj.ContainerId) {
			obj.ContainerId = (this.hit.get('Containers') || [])[0];
		}

		return obj.ContainerId;
	}
};

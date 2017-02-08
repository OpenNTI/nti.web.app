export default {
	handles : {
		'application/vnd.nextthought.note': true
	},

	getTitle (hit, obj) {
		return obj.title || obj.label;
	},

	getFragments (hit, obj) {
		return obj.fragments;
	}
};

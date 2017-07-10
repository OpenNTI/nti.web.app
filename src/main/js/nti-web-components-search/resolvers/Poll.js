export default {
	handles (targetMimeType) {
		return targetMimeType === 'application/vnd.nextthought.napoll';
	},

	resolveTitle () {
		return 'Poll';
	}
};

import {getService} from '@nti/web-client';

export default {
	handles (targetMimeType) {
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		if(targetMimeType === 'ntitranscript') {
			return true;
		} else {
			return false;
		}
	},

	resolveObject (hit) {
		let containerId = hit && hit.ContainerId;
		if (!containerId && hit) {
			containerId = (hit.Containers || [])[0];
		}

		return getService()
			.then(service => service.getObject(containerId));
	},

	resolveNavigateToSearchHit (obj, hit, fragment) {
		const fragIndex = fragment.fragIndex,
			start = hit.StartMilliSecs,
			VideoID = hit.VideoID;

		obj.startMillis = start || 0;

		return Promise.resolve({obj, fragIndex, VideoID});
	}
};

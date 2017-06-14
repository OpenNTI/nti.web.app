import {getService} from 'nti-web-client';

export default {
	resolveObject (hit) {
		return getService()
			.then(service => service.getObject(hit.NTIID));
	},

	initComponent (obj, hit) {

	},

	resolveTitle (obj, hit) {
		return obj.title || obj.label || obj.Title || '';
	},

	resolveFragments (obj, hit) {
		const fragments = hit.Fragments || [];

		return fragments.reduce((acc, frag, fragIndex) => {
			const {Matches:matches = []} = frag;

			if (frag.Field !== 'keywords') {
				matches.reduce((ac, match) => {
					ac.push({
						fragIndex,
						text: match.trim()
					});

					return ac;
				}, acc);
			}
			return acc;
		}, []);
	},

	resolvePath (obj, hit, getBreadCrumb) {
		return getBreadCrumb(obj).then(function (breadCrumb) {
			return breadCrumb;
		});
	},

	resolveContainerID (obj, hit) {
		return hit && hit.isModel && hit.ContainerId || (hit.Containers || [])[0];
	},

	resolveNavigateToSearchHit (obj, hit, fragment) {
		const containerId = hit && hit.isModel && hit.ContainerId || (hit.Containers || [])[0],
			fragIndex = fragment.fragIndex;
		return Promise.resolve({obj, fragIndex, containerId});
	}
};

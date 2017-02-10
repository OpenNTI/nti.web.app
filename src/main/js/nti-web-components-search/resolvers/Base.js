import {getService} from 'nti-web-client';

export default {
	resolveObject (hit) {
		return getService()
			.then(service => service.getObject(hit.NTIID));
	},

	resolveTitle (obj, hit) {
		return obj.Title || obj.label || '';
	},

	resolveFragments (obj, hit) {
		const fragments = hit.Fragments;

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
		return hit.ContainerId || (hit.Containers || [])[0];
	},
};

import { getService } from '@nti/web-client';

export default {
	handles(targetMimeType) {
		return targetMimeType === 'application/vnd.nextthought.naquestion';
	},

	resolveTitle(obj, hit) {
		const containerId =
			(hit && hit.ContainerId) || (hit.Containers || [])[0];

		return getService()
			.then(service => service.getObject(containerId))
			.then(container => {
				return (
					container.title || container.label || container.Title || ''
				);
			});
	},
};

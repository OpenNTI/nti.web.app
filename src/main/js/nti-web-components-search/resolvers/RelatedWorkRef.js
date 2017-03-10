import {getService} from 'nti-web-client';

export default {
	handles (targetMimeType) {
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		if(targetMimeType === 'relatedworkref') {
			return true;
		} else {
			return false;
		}
	},

	addByLine (name) {
		const creator = `By ${name}`;

		this.renderData.creator = creator;

		if (this.rendered) {
			this.creatorEl.update(creator);
		}
	},

	resolveObject (hit) {
		const byline = hit.get('byline');
		const label = hit.get('label');

		if (byline) {
			this.addByLine(byline);
		}

		this.setTitle(label);

		return getService()
				.then(service => service.getObject(hit.NTIID));
	},
};

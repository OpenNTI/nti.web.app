import { getService } from '@nti/web-client';

export async function hasUserSegments() {
	const service = await getService();

	return Boolean(service.getCollection('Segments', 'SiteAdmin'));
}

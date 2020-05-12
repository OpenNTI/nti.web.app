import {getServer} from '@nti/web-client';

import BrandingStore from '../../branding/Store';
import {
	ERROR,
	LOADING,
	MODIFIED,
	THEME,
	SITE_BRAND,
	CAN_RESET
} from '../../branding/constants';

const PreviewRel = 'certificate_preview';

export default class CertificateStylingStore extends BrandingStore {
	static Error = ERROR;
	static Loading = LOADING;
	static Modified = MODIFIED;
	static Theme = THEME;
	static SiteBrand= SITE_BRAND;
	static CanReset = CAN_RESET;
	static Save = 'save';
	static Cancel = 'cancel';
	static Reset = 'reset';
	static SetAsset = 'setAsset';
	static SetBrandProp = 'setBrandProp';
	static SetThemeProp = 'setThemeProp';

	async getPreviewBlob () {
		const brand = this.get(SITE_BRAND);
		const previewLink = brand.getLink(PreviewRel);

		const server = getServer();
		const resp = await server.get({
			method: 'PUT',
			blob: true,
			url: previewLink,
			data: this.getFormData()
		});

		return resp;
	}
}
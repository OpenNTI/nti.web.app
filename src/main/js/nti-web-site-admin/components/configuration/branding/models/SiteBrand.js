/* eslint-disable camelcase */
import {Models, registerModel} from '@nti/lib-interfaces';

export default class SiteBrand extends Models.Base {
	static MimeType = Models.COMMON_PREFIX + 'sitebrand'

	static Fields = {
		...Models.Base.Fields,
		assets:      { type: 'object' },
		theme:       { type: 'object' },
		brand_name:  { type: 'string' },
		brand_color: { type: 'string' },
		certificate_label: {type: 'string' },
		certificate_brand_color: { type: 'string' },
		suppress_certificate_logo: {type: 'boolean'},
		UneditableEmailImage: { type: 'boolean'}
	}
}

registerModel(SiteBrand);

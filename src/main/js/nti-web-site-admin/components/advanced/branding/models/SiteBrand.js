/* eslint-disable camelcase */
import {Models, registerModel} from '@nti/lib-interfaces';

export default
@registerModel
class SiteBrand extends Models.Base {
	static MimeType = Models.COMMON_PREFIX + 'sitebrand'

	static Fields = {
		...Models.Base.Fields,
		assets:      { type: 'object' },
		theme:       { type: 'object' },
		brand_name:  { type: 'string' },
		brand_color: { type: 'string' },
		UneditableEmailImage: { type: 'boolean'}
	}
}

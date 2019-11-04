import {Models, registerModel} from '@nti/lib-interfaces';

export default
@registerModel
class SiteBrand extends Models.Base {
	static MimeType = Models.COMMON_PREFIX + 'sitebrand'
}

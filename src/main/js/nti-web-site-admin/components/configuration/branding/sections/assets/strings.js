import { scoped } from '@nti/lib-locale';

import { types } from './constants';

export default scoped('nti-web-app.admin.branding.logo', {
	title: 'Logo Assets',
	types: {
		[types.logo]: {
			title: 'Square Format',
			description:
				'We recommend this asset be close to a square in proportion. The ideal dimensions are 140x140 pixels.',
		},
		[types.fullLogo]: {
			title: 'Wide Format',
			description:
				'The wider orientation has space for your icon and company name. We recommend a height of 140 pixels.',
		},
		[types.email]: {
			title: 'Email Header',
			description:
				'The email template is flexibile enough to accomodate various lockups.',
		},
		[types.favicon]: {
			title: 'Favicon',
			description:
				'This square asset helps users identify your site among their open browser tabs. We recommend a size of 32x32 pixels for this asset.',
		},
		// [types.login]: {
		// 	title: 'Login Image',
		// 	description: 'Welcome people back with an image that speaks to your brand.'
		// },
	},
});

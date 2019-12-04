import {types as assetTypes} from '../sections/assets/constants';

// dumb re-export hack just to reorder the items.
const {
	fullLogo,
	logo,
	email,
	favicon,
	...others
} = assetTypes;

export const types = {
	fullLogo,
	logo,
	email,
	favicon,
	...others
};

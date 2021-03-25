export const types = {
	logo: 'logo',
	fullLogo: 'full_logo',
	email: 'email',
	favicon: 'favicon',
};

export const formatting = {
	logo: {crop: {aspectRatio: 1}, maxHeight: 140},
	'full_logo': {crop: {maxAspectRatio: 300 / 70}, maxHeight: 140},
	favicon: {crop: {aspectRatio: 1}, maxHeight: 64}
}

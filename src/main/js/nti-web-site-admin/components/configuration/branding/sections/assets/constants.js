export const types = {
	logo: 'logo',
	fullLogo: 'full_logo',
	email: 'email',
	favicon: 'favicon',
};

export const formatting = {
	logo: { crop: { aspectRatio: 1 } },
	full_logo: { crop: { maxAspectRatio: 300 / 70 } },
	email: { crop: {} },
	favicon: {crop: {aspectRatio: 1}}
};

export const outputSize = {
	logo: { maxHeight: 210 },
	full_logo: { maxHeight: 210 },
	email: { maxHeight: 80 },
	favicon(editorState) {
		const height = editorState.layout.image.height;

		if (height >= 32) {
			return { height: 32 };
		}

		return { height: 16 };
	},
};

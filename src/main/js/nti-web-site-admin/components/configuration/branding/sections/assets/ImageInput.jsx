import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {StandardUI, Text} from '@nti/web-commons';
import {ImageEditor} from '@nti/web-whiteboard';

import styles from './ImageInput.css';

const cx = classnames.bind(styles);

const t = scoped('nti-web.admin.components.configuration.branding.sections.assets.ImageInput', {
	save: 'Update'
});

const AcceptsOverrides = {
	favicon: 'image/png, image/gif, image/x-icon',
};

const Title = styled(Text.Base).attrs({as: 'h1'})`
	font-size: 1.75rem;
	font-weight: 300;
	color: var(--secondary-grey);
	text-align: center;
	margin: 0;
`;

const ImageWrapper = styled.div`
	width: 610px;
	max-width: 75vw;
	margin: 2rem;
`;

export default function ImageInput({ onChange: onChangeProp, name, formatting, outputSize, children, title }) {
	const [editorState, setEditorState] = React.useState(null);
	const [filename, setFilename] = React.useState(null);

	const onCancel = () => setEditorState(null);
	const updateImage = async () => {
		const file = await ImageEditor.getBlobForEditorState(editorState, outputSize);
		const source = ImageEditor.getDataURLForEditorState(editorState, outputSize);

		onChangeProp({file, source, filename});
		setEditorState(null);
	};

	const [error, setError] = React.useState(null);


	const onChange = async (e) => {
		try {
			const {target: {files = []}} = e;
			const src = files[0] && await ImageEditor.getImgSrc(files[0]);
			const img = src && await ImageEditor.getImg(src);

			if (!img) { throw new Error('Unable to load img'); }

			const editorState =  ImageEditor.getEditorState(img, formatting || {});

			setFilename(files[0].name);
			setEditorState(editorState);
		} catch (err) {
			setError(err);
		}
	};

	return (
		<>
			<button role="button" className={cx('image-input', {error})}>
				<input
					type="file"
					name={name}
					onChange={onChange}
					accept={AcceptsOverrides[name] || 'image/*'}
				/>
				{children}
			</button>
			{editorState && (
				<StandardUI.Prompt.Base
					actionType="constructive"
					actionLabel={t('save')}
					onAction={updateImage}

					onCancel={onCancel}
				>
					{title && (<Title>{title}</Title>)}
					<ImageWrapper>
						<ImageEditor.Editor editorState={editorState} onChange={setEditorState} />
					</ImageWrapper>
				</StandardUI.Prompt.Base>
			)}
		</>
	);
}

ImageInput.propTypes = {
	onChange: PropTypes.func,
	name: PropTypes.string,
	formatting: PropTypes.object,
	outputSize: PropTypes.object,
	title: PropTypes.string
};

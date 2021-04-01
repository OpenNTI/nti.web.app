import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { scoped } from '@nti/lib-locale';
import { StandardUI, Text } from '@nti/web-commons';
import { ImageEditor } from '@nti/web-whiteboard';

import styles from './ImageInput.css';

const cx = classnames.bind(styles);

const t = scoped(
	'nti-web.admin.components.configuration.branding.sections.assets.ImageInput',
	{
		save: 'Update',
		processing: 'Processing...'
	}
);

const AcceptsOverrides = {
	favicon: 'image/png, image/gif, image/x-icon',
};

const Title = styled(Text.Base).attrs({ as: 'h1' })`
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

const Mask = styled(Text.Base)`
	color: var(--primary-grey);
`;

const initialState = {inputKey: 1, error: null, filename: null, editorState: null, saving: false};
const reducer = (state, action) => {
	switch (action.type) {
		case 'error':
			return {
				...state,
				error: action.error,
				saving: false
			};
		case 'addFile':
			return {
				...state,
				error: null,
				filename: action.filename,
				editorState: action.editorState,
				inputKey: (state.inputKey ?? 0) + 1,
				saving: false
			};
		case 'updateEditorState':
			return {
				...state,
				editorState: action.editorState,
				saving: false
			};
		case 'clear':
			return {
				...state,
				filename: null,
				editorState: null,
				saving: false
			};
		case 'saving':
			return {
				...state,
				saving: true
			};
		default:
			return state;
	}
}

export default function ImageInput({
	onChange: onChangeProp,
	name,
	formatting,
	outputSize,
	children,
	title,
}) {
	const [
		{
			editorState,
			filename,
			inputKey,
			error,
			saving
		},
		dispatch
	] = React.useReducer(reducer, initialState);

	const onCancel = () => dispatch({type: 'clear'});
	const updateImage = async () => {
		dispatch({type: 'saving'});

		try {
			const size = typeof outputSize === 'function' ? outputSize(editorState) : outputSize;
			const file = await ImageEditor.getBlobForEditorState(
				editorState,
				size
			);

			file.name = filename;

			const source = await ImageEditor.getImgSrc(file);

			onChangeProp({ file, source, filename });
			dispatch({type: 'clear'});
		} catch (e) {
			dispatch({type: 'error', error: e});
		}
	};

	const setEditorState = (newEditorState) => {
		dispatch({type: 'updateEditorState', editorState: newEditorState});
	};


	const onChange = async e => {

		try {
			const {
				target: { files = [] },
			} = e;
			const src = files[0] && (await ImageEditor.getImgSrc(files[0]));
			const img = src && (await ImageEditor.getImg(src));

			if (!img) {
				throw new Error('Unable to load img');
			}

			dispatch({
				type: 'addFile',
				filename: files[0].name,
				editorState: ImageEditor.getEditorState(img, formatting || {})
			});
		} catch (err) {
			dispatch({type: 'error'})
		}

		e.stopPropagation();
		e.preventDefault();
	};

	return (
		<>
			<button role="button" className={cx('image-input', { error })}>
				<input
					type="file"
					name={name}
					key={inputKey}
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
					mask={saving ? (<Mask>{t('processing')}</Mask>) : null}
				>
					{title && <Title>{title}</Title>}
					<ImageWrapper>
						<ImageEditor.Editor
							editorState={editorState}
							onChange={setEditorState}
						/>
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
	title: PropTypes.string,
};

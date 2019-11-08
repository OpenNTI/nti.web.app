import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import {ASSETS} from '../../constants';

import styles from './AssetItem.css';
import ImageInput from './ImageInput';

const cx = classnames.bind(styles);

const NameToTheme = {
	'full_logo': 'fullLogo'
};

export default function AssetItem ({onChange, getText, name}) {
	const asset = Theme.useThemeProperty(`${ASSETS}.${NameToTheme[name] || name}`);

	const change = e => {
		const {target: {files = []} = {}} = e;
		if (files[0]) {
			const file = files[0];
			const reader = new FileReader();

			reader.onload = () => {
				const {result: source} = reader;

				onChange({
					filename: file.name,
					source
				});
			};
			reader.readAsDataURL(file);
		}
	};


	return (
		<div className={cx('asset-item')}>
			<div className={cx('info')}>
				<div className={cx('title')}>{getText('title')}</div>
				<div>{getText('description')}</div>
				<div className={cx('file-info')}>
					{asset.filename && <span className={cx('filename')}>{asset.filename}</span>}
					<div>
						<ImageInput name={name} onChange={change}>Change</ImageInput>
					</div>
				</div>
			</div>
			<div className={cx('preview')}>
				<Theme.Asset property={asset} />
			</div>
		</div>
	);
}

AssetItem.propTypes = {
	onChange: PropTypes.func,
	getText: PropTypes.func,
	name: PropTypes.string,
	edit: PropTypes.object
};

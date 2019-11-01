import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import styles from './AssetItem.css';
import ImageInput from './ImageInput';

const cx = classnames.bind(styles);

export default function AssetItem ({onChange, getText, filename, src}) {

	const [imgSrc, setImgSrc] = React.useState(src);
	const [fname, setName] = React.useState(filename);

	const change = e => {
		const {target: {files = []} = {}} = e;
		if (files[0]) {
			const file = files[0];
			setName(file.name);
			const reader = new FileReader();
			reader.onload = () => {
				const {result: source} = reader;
				setImgSrc(source);
				onChange({
					filename: fname,
					source
				});
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className={cx('asset-item')}>
			<div>
				<div>{getText('title')}</div>
				<div>{getText('description')}</div>
				<div>
					{fname && <span>{fname}</span>}
					<ImageInput onChange={change}>Change</ImageInput>
				</div>
			</div>
			<div className={cx('preview')}>
				{imgSrc && <img src={imgSrc} />}
			</div>
		</div>
	);
}

AssetItem.propTypes = {
	onChange: PropTypes.func,
	getText: PropTypes.func,
	filename: PropTypes.string,
	src: PropTypes.string
};

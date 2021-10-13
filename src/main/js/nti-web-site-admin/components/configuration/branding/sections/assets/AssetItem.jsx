import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Theme } from '@nti/web-commons';

import { ASSETS } from '../../constants';
import { Title, Description } from '../../ParameterText';

import styles from './AssetItem.css';
import ImageInput from './ImageInput';

const cx = classnames.bind(styles);

const NameToTheme = {
	full_logo: 'fullLogo',
};

export default function AssetItem({
	onChange,
	getText,
	name,
	formatting,
	outputSize,
	onThumbClick,
}) {
	const asset = Theme.useThemeProperty(
		`${ASSETS}.${NameToTheme[name] || name}`
	);

	const change = ({ file, source, filename }) => {
		onChange({
			filename,
			source,
			file,
		});
	};

	return (
		<div className={cx('asset-item')}>
			<div className={cx('info')}>
				<Title>{getText('title')}</Title>
				<Description>{getText('description')}</Description>
				<div className={cx('file-info')}>
					{asset.filename && (
						<span className={cx('filename')}>{asset.filename}</span>
					)}
					<div>
						<ImageInput
							name={name}
							title={getText('title')}
							formatting={formatting}
							outputSize={outputSize}
							onChange={change}
						>
							Change
						</ImageInput>
					</div>
				</div>
			</div>
			<div className={cx('preview')}>
				<Theme.Asset property={asset} onClick={onThumbClick} />
			</div>
		</div>
	);
}

AssetItem.propTypes = {
	onChange: PropTypes.func,
	getText: PropTypes.func,
	formatting: PropTypes.object,
	outputSize: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
	name: PropTypes.string,
	edit: PropTypes.object,
	onThumbClick: PropTypes.func,
};

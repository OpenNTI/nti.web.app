import PropTypes from 'prop-types';

import Section from '../Section';

import t from './strings';
import { types, formatting, outputSize } from './constants';
import AssetItem from './AssetItem';

export default function Assets({
	assets,
	onChange,
	onThumbClick,
	canEditEmail,
}) {
	const changeHandler = type => item => onChange(type, item);

	return (
		<Section text={t}>
			{Object.values(types)
				.filter(type => canEditEmail || type !== 'email')
				.map(type => (
					<AssetItem
						key={type}
						name={type}
						formatting={formatting[type]}
						outputSize={outputSize[type]}
						onChange={changeHandler(type)}
						onThumbClick={onThumbClick}
						getText={k => t(['types', type, k])}
					/>
				))}
		</Section>
	);
}

Assets.propTypes = {
	assets: PropTypes.object,
	onChange: PropTypes.func.isRequired,
	onThumbClick: PropTypes.func,
	canEditEmail: PropTypes.bool,
};

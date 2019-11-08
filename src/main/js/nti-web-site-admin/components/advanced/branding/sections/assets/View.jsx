import React from 'react';
import PropTypes from 'prop-types';

import Section from '../Section';

import t from './strings';
import {types} from './constants';
import AssetItem from './AssetItem';

export default function Assets ({assets, onChange, onThumbClick}) {
	const changeHandler = type => item => onChange(type, item);


	return (
		<Section text={t}>
			{
				Object.values(types).map(type => (
					<AssetItem
						key={type}
						name={type}
						onChange={changeHandler(type)}
						onThumbClick={onThumbClick}
						getText={k => t(['types', type, k])}
					/>
				))
			}
		</Section>
	);
}

Assets.propTypes = {
	assets: PropTypes.object,
	onChange: PropTypes.func.isRequired,
	onThumbClick: PropTypes.func
};

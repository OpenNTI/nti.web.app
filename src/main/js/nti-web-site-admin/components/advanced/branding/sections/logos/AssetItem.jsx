import React from 'react';
import PropTypes from 'prop-types';

export default function AssetItem ({onChange, name, value}) {
	return (
		<div>
			{name}
			<img src={value} onClick={onChange} />
		</div>
	);
}
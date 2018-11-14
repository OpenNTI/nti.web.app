import React from 'react';
import PropTypes from 'prop-types';

export default function column (prop, header) {
	return (
		class PropertyColumn extends React.Component {

			static propTypes = {
				item: PropTypes.object
			}

			static HeaderComponent = () => header

			render () {
				const {item = {}} = this.props;
				const value = prop.split ? prop.split('.').reduce((result, part) => result ? result[part] : null, item) : item[prop];

				const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
				return (
					<div>{display}</div>
				);
			}
		}
	);
}

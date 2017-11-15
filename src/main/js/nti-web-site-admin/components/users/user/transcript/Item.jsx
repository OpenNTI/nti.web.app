import React from 'react';
import PropTypes from 'prop-types';

SiteAdminUserTranscriptItem.propTypes = {
	item: PropTypes.object
};
export default function SiteAdminUserTranscriptItem ({item}) {
	return (
		<span>
			{item.title}
		</span>
	);
}

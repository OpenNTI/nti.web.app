import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

const t = scoped('nti-web-site-admin.components.common.SearchInfo', {
	showing: 'Showing results for "%(searchTerm)s"'
});

SearchInfo.propTypes = {
	searchTerm: PropTypes.string
};

export default function SearchInfo ({searchTerm}) {
	if(!searchTerm) {
		return null;
	}

	return <div className="site-admin-table-search-info">{t('showing', {searchTerm})}</div>;
}

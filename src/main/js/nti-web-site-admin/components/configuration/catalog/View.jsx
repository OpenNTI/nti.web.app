
import { Text, StandardUI } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';

import { AnonymousCatalog } from './AnonymousCatalog';

const { Box } = StandardUI;

const t = scoped('nti-web-app.admin.config.Catalog', {
	title: 'Catalog',
});

const Title = styled(Text.Base, { allowAs: true }).attrs({ as: 'h1' })`
	margin-top: 0;
`;

export function Catalog(props) {
	return (
		<Box p="lg" sh="sm">
			<Title>{t('title')}</Title>
			<AnonymousCatalog />
		</Box>
	);
}

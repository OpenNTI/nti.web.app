export const Body = styled('div').attrs({ className: 'contents' })`
	max-height: calc(100vh - 200px);
	min-height: 411px;
	overflow-y: auto;

	:global(.nti-select-native-wrapper),
	:global(.button) {
		&:focus-within {
			outline: 1px solid var(--secondary-blue) !important;
		}
	}
`;

export const Label = styled.div`
	font-size: 14px;
	color: var(--tertiary-grey);

	/* width: 2rem; */
`;

export const Row = styled.div`
	padding: 0 1.25rem;
	display: flex;
	align-items: baseline;
	border-bottom: solid 1px #ddd;
	&:first-child {
		border-top: solid 1px #ddd;
	}
`;

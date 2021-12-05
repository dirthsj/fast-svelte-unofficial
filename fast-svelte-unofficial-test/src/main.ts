
import { allComponents, provideFASTDesignSystem } from '@microsoft/fast-components';

provideFASTDesignSystem()
	.register(allComponents);

import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;
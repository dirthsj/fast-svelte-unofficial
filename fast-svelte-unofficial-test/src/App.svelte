<script lang='ts'>
	import { FastAccordion, FastAccordionItem, FastAnchor } from 'fast-svelte-unofficial';

	const onAccordianChanged = (x: CustomEvent) => {
		console.log('something changed within the accordian');
	}
</script>

<style>
	:global(body) {
		background-color: var(--fill-color);
		color: var(--neutral-foreground-rest);
	}
</style>


<FastAccordion id="awesome-accordian-id">
	<div slot="item">
		<FastAccordionItem expanded={true}>
			<span slot="heading">
				Example heading
			</span>
			Example Content
		</FastAccordionItem>
		<FastAccordionItem id="awesome-item-id" expanded={false} heading_level={5}>
			<span slot="heading">
				Another example heading
			</span>
			<span slot="collapsed-icon">+</span>
			<span slot="expanded-icon">-</span>
			<span slot="start">@</span>
			<span slot="end">...</span>
			More Content
		</FastAccordionItem>
	</div>
</FastAccordion>

<FastAnchor href="#">String</FastAnchor>

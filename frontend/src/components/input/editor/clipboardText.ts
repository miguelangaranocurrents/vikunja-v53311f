import type {Fragment} from '@tiptap/pm/model'

// Plain-text copy of a list keeps its markers. ProseMirror's default serializer drops them,
// leaving each item as a bare line that reads as unrelated paragraphs once pasted elsewhere.
const LIST_MARKERS: Record<string, (index: number) => string> = {
	bulletList: () => '- ',
	taskList: () => '- ',
	orderedList: index => `${index + 1}. `,
}

export function serializeClipboardText(fragment: Fragment): string {
	const blocks: string[] = []

	fragment.forEach(node => {
		const marker = LIST_MARKERS[node.type.name]
		if (marker !== undefined) {
			const items: string[] = []
			node.forEach((item, _offset, index) => {
				const [first, ...rest] = serializeClipboardText(item.content).split('\n')
				items.push([marker(index) + first, ...rest.map(line => '  ' + line)].join('\n'))
			})
			blocks.push(items.join('\n'))
		} else if (node.isTextblock) {
			blocks.push(node.textBetween(0, node.content.size, undefined, '\n'))
		} else if (node.isBlock && !node.isLeaf) {
			blocks.push(serializeClipboardText(node.content))
		} else {
			blocks.push(node.textContent)
		}
	})

	return blocks.join('\n\n')
}

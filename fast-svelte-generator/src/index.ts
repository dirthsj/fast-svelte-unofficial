import { readFileSync, writeFileSync } from 'fs';
import { capitalize } from 'lodash-es';
import { resolve } from 'path';

const data = readFileSync('node_modules/@microsoft/fast-components/dist/esm/component-definitions.js')
    .toString();
const regex = /import .+ from \"\.\/(.+)\"/g;

const results = data.matchAll(regex);

let files = [];

while (true) {
    const result = results.next();
    if (result.value) {
        files.push(resolve('node_modules/@microsoft/fast-components/dist/esm/', result.value[1]));
    }
    if (result.done) break;
}

interface ComponentAttribute {
    name: string,
    title: string,
    description: string,
    type: string,
    default?: unknown,
    values?: { name: string }[]
    required: false;
}

interface ComponentSlot {
    name: string,
    title: string,
    description: string,
}

interface ComponentDef {
    version: number,
    tags: [
        {
            name: string,
            title: string,
            description: string,
            attributes: ComponentAttribute[],
            slots: ComponentSlot[]
        }
    ]
}

let componentDefs: ComponentDef[] = [];

for (const file of files) {
    const data = readFileSync(file);
    const parsed = JSON.parse(data.toString()) as ComponentDef;
    componentDefs.push(parsed);
}

const defTags = componentDefs.map(x => x.tags[0]);

interface SvelteComponentDefWrapper {
    componentName: string,
    htmlTag: string,
    attributes: SvelteComponentDefWrapperAttribute[],
    slots: string[]
}

interface SvelteComponentDefWrapperAttribute {
    svelteExportJsdocType: string,
    svelteExportName: string,
    htmlAttributeName: string,
}

const wrappers: SvelteComponentDefWrapper[] = defTags.map((x): SvelteComponentDefWrapper => ({
    componentName: `${x.name.split('-').map(y => capitalize(y)).join('')}`,
    htmlTag: x.name,
    attributes: x.attributes.map((x): SvelteComponentDefWrapperAttribute => ({
        svelteExportJsdocType: x.values ? x.values.map(x => `'${x.name}'`).join(' | ') : x.type,
        svelteExportName: x.name.replaceAll('-', '_'),
        htmlAttributeName: x.name,
    })),
    slots: x.slots.map(x => x.name)
}))

const serializeSvelteComponentDefWrapper = (component: SvelteComponentDefWrapper): string => {
    let result = '';

    result += "<script>\n";

    result += "\texport let component;\n"

    result += component.attributes.map(x => `\t/** @type { ${x.svelteExportJsdocType} | null } */\n\texport let ${x.svelteExportName} = null;\n`).join('');
    
    result += "</script>\n\n";

    result += `<${component.htmlTag} bind:this={component}`;

    result += component.attributes.map(x => `\n\t${x.htmlAttributeName}={${x.svelteExportName}}`).join('');

    result += `\n\t{...$$restProps}>`
    
    result += component.slots.map(x => x !== '' ? `\n\t<slot name="${x}"/>` : '\n\t<slot/>').join('');

    result += `\n</${component.htmlTag}>`;

    return result;
}

for (const wrapper of wrappers) {
    const filename = `${wrapper.componentName}.svelte`;
    const body = serializeSvelteComponentDefWrapper(wrapper);

    writeFileSync(`../fast-svelte-unofficial/src/${filename}`, body);
}

const indexjs = wrappers.map(x => `export { default as ${x.componentName} } from './${x.componentName}.svelte';`).join('\n');

writeFileSync('../fast-svelte-unofficial/src/index.js', indexjs);
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

export const generateTeamName = () => {
    return `The ${uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: ' ', style: 'capital' })}s`;
}


export const importHtmlAsString = (path: string) => {
    const file = Bun.file(path);
    return file.text();
}

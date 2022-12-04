import * as path from 'path';
import * as faker from 'faker/locale/zh_CN';

export const generateTableColumConfig = (tokens: Map<string, string>) => {
    let content = `export const getTableColumns =()=>[ `;
    content += Array.from(tokens).map(s => {
        return `{
            prop:'${s[0]}',
            label:'${s[1]}'
        }`;
    }).join(',');
    content += '\n]';
    return content;
};

export const generateDescriptionFiled = (tokens: Map<string, string>) => {

};

export const generateEditFormFiled = (tokens: Map<string, string>) => {

};

export const generateSearchFormFiled = (tokens: Map<string, string>) => {

};

export const generateCrudFormFiled = (tokens: Map<string, string>) => {

};
export const deleteExt = (file: string, ext: string) => {
    const base = path.basename(file, ext);
    return path.join(path.dirname(file), base).trim();
};

export const generateFakerData = (tokens: Map<string, string>) => {
    return new Array(20).fill(0).map(s => {
        const obj = {};
        Array.from(tokens).forEach(s => {
            const typeName = s[1].toLowerCase();
            if (typeName === 'number') {
                obj[s[0]] = faker.datatype.number();
                return;
            }
            if (typeName.includes('[') && typeName.includes(']')) {
                obj[s[0]] = faker.datatype.array(5);
                return;
            }
            if (typeName === 'boolean') {
                obj[s[0]] = faker.datatype.number();
                return;
            }
            if (s[0].toLowerCase() === 'id' && typeName === 'string') {
                obj[s[0]] = faker.datatype.uuid();
                return;
            }
            if (typeName === 'string' && (s[0].toLowerCase().includes('id') || s[0].toLowerCase().includes('code'))) {
                obj[s[0]] = faker.random.alphaNumeric();
                return;
            }
            obj[s[0]] = faker.random.words();
        });
        return obj;
    });
};
import * as path from 'path';
import { faker } from '@faker-js/faker';

export const generateTableColumConfig = (tokens: Map<string, string>) => {
  let content = `export const getTableColumns =()=>[ `;
  content += Array.from(tokens)
    .map((s) => {
      return `{
            prop:'${s[0]}',
            label:'${s[1]}'
        }`;
    })
    .join(',');
  content += '\n]';
  return content;
};

export const generateDescriptionFiled = (tokens: Map<string, string>) => {
  let content = `export const getFileds =()=>[ `;
  content += Array.from(tokens)
    .map((s) => {
      return `{
              prop:'${s[0]}',
              label:'${s[1]}'
          }`;
    })
    .join(',');
  content += '\n]';
  return content;
};

export const generateEditFormFiled = (tokens: Map<string, string>) => {};

export const generateSearchFormFiled = (tokens: Map<string, string>) => {
  let content = `export const getSearchItems =()=>[ `;
  content += Array.from(tokens)
    .map((s) => {
      return `{
              prop:'${s[0]}',
              label:'${s[1]}'
          }`;
    })
    .join(',');
  content += '\n]';
  return content;
};

export const generateCrudFormFiled = (tokens: Map<string, string>) => {
  let content = `export const getTableColumns =()=>[ `;
  content += Array.from(tokens)
    .map((s) => {
      return `{
              prop:'${s[0]}',
              label:'${s[1]}'
          }`;
    })
    .join(',');
  content += '\n]';
  content += '\n\n\n';
  content += `export const getSearchItems =()=>[ `;
  content += Array.from(tokens)
    .map((s) => {
      return `{
              prop:'${s[0]}',
              label:'${s[1]}'
          }`;
    })
    .join(',');
  content += '\n]';
  return content;
};
export const deleteExt = (file: string, ext: string) => {
  const base = path.basename(file, ext);
  return path.join(path.dirname(file), base).trim();
};

export const generateArrayFakerData = (tokens: Map<string, string>) => {
  let content = 'export const getMockData = ()=>[';
  const data = new Array(20).fill(0).map((s) => {
    return generateFakerData(tokens);
  });
  content += data
    .map((item) => {
      return JSON.stringify(item);
    })
    .join(',\n');
  content += '\n]';
  return content;
};

export const generateObjectFakerData = (tokens: Map<string, string>) => {
  let content = 'export const getMockData = ()=>(';
  const data = generateFakerData(tokens);
  content += JSON.stringify(data);
  content += '\n)';
  return content;
};
export const generateFakerData = (tokens: Map<string, string>) => {
  const obj = {};
  Array.from(tokens).forEach((s) => {
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
    if (
      typeName === 'string' &&
      (s[0].toLowerCase().includes('id') || s[0].toLowerCase().includes('code'))
    ) {
      obj[s[0]] = faker.random.alphaNumeric();
      return;
    }
    obj[s[0]] = faker.random.words();
  });
  return obj;
};

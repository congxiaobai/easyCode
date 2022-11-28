/* eslint-disable @typescript-eslint/naming-convention */
export enum TypeGroup {
  Primitive,
  Array,
  Object,
  Date
}

export interface TypeDescription {
  id: string;
  isUnion?: boolean;
  typeObj?: { [index: string]: string };
  arrayOfTypes?: string[];
}

export interface TypeStructure {
  rootTypeId: string;
  types: TypeDescription[];
}

export interface NameEntry {
  id: string;
  name: string;
  IName:string;
  ModelName:string;
  VMName:string;
}

export interface NameStructure {
  rootName: string;
  names: NameEntry[];
}

export interface InterfaceDescription {
  name: string;
  IName:string;
  ModelName:string;
  VMName:string;
  typeMap: object;
}

export type ModalType = 'interface' | 'modal' | 'viewModal'
export interface Options {
  rootName: string;
  modalType: ModalType;
}

export interface KeyMetaData {
  keyValue: string;
  isOptional: boolean;
}

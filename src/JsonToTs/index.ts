/* eslint-disable @typescript-eslint/naming-convention */
import { getTypeStructure, optimizeTypeStructure } from "./get-type-structure";
import { ModalType, NameEntry, Options } from "./model";
import { shim } from "es7-shim/es7-shim";
import {
  getInterfaceDescriptions,
  getInterfaceStringFromDescription,
  getClassStringFromDescriptionByInterface
} from "./get-interfaces";
import { getNames } from "./get-names";
import { isArray, isObject } from "./util";
shim();

export default function JsonToTS(json: any, userOptions?: Options): any {
  const defaultOptions: Options = {
    rootName: "RootObject",
    modalType: 'interface',
  };
  const options = {
    ...defaultOptions,
    ...userOptions
  };

  /**
   * Parsing currently works with (Objects) and (Array of Objects) not and primitive types and mixed arrays etc..
   * so we shall validate, so we dont start parsing non Object type
   */
  const isArrayOfObjects =
    isArray(json) &&
    json.length > 0 &&
    json.reduce((a, b) => a && isObject(b), true);

  if (!(isObject(json) || isArrayOfObjects)) {
    throw new Error("Only (Object) and (Array of Object) are supported");
  }

  const typeStructure = getTypeStructure(json);
  /**
   * due to merging array types some types are switched out for merged ones
   * so we delete the unused ones here
   */
  optimizeTypeStructure(typeStructure);
  console.log({ typeStructure });
  const names = getNames(typeStructure, options.rootName);
  console.log({ names });
  return { names, typeStructure };

}

export function paseInterface(names: NameEntry[], typeStructure: any, modalType: ModalType): string[] {
  const types = getInterfaceDescriptions(typeStructure, names, modalType);
  console.log({ types });
  if (modalType === 'interface') {
    return types.map(getInterfaceStringFromDescription);
  }
  return types.map(getClassStringFromDescriptionByInterface);
}
export function getAllInterface(names: NameEntry[], typeStructure: any):string[]{
  const types = getInterfaceDescriptions(typeStructure, names, 'interface');
  return types.map(item=>item.IName);
}


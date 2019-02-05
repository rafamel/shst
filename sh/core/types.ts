export interface IDef {
  was: string;
  is: string;
  doc?: string;
}

export type TKind = 'scalar' | 'enum' | 'struct' | 'interface';

export interface ITypeMap {
  [key: string]: ITypeDef;
}

export interface ITypeDef extends IDef {
  kind: TKind;
}

export interface ITypeDefMap {
  [key: string]: TTypeDef;
}

export type TTypeDef = IEnumDef | IStructDef | IInterfaceDef;

export interface IEnumDef extends ITypeDef {
  kind: 'enum';
  values: string[];
}

export interface IStructDef extends ITypeDef {
  kind: 'struct';
  fields: IFieldDef[];
  methods: IMethodDef[];
  implements: string[];
}

export interface IInterfaceDef extends ITypeDef {
  kind: 'interface';
  methods: IMethodDef[];
  implementedBy: string[];
}

export interface IFieldDef extends IDef {
  value: IValue;
}

export interface IMethodDef extends IDef {
  params: Array<{
    name: string;
    value: IValue;
  }>;
  returns: IValue;
}

export interface IValue {
  list: boolean;
  type: string;
}

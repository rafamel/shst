export interface IDef {
  was: string;
  is: string;
  doc?: string;
}

export type TKind = 'enum' | 'struct' | 'interface' | 'scalar';

export interface ITypeDef extends IDef {
  kind: TKind;
}

export type TTypeDefs = IEnumDef | IStructDef | IInterfaceDef;

export interface ITypeMap {
  [key: string]: ITypeDef;
}

export interface IEnumDef extends ITypeDef {
  kind: 'enum';
  values: string[];
}

export interface IStructDef extends ITypeDef {
  kind: 'struct';
  fields: IPropDef[];
  methods: any[]; // TODO
}

export interface IInterfaceDef extends ITypeDef {
  kind: 'interface';
  values: string[];
}

export interface IPropDef extends IDef {
  list: boolean;
  type: string;
}

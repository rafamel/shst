export interface IDef {
  was: string;
  is: string;
  doc?: string;
}

export type TKind = 'scalar' | 'enum' | 'interface' | 'struct';

export interface ITypeMap {
  [key: string]: ITypeDef;
}

export interface ITypeDef extends IDef {
  kind: TKind;
}

export interface ITypeDefMap {
  [key: string]: TTypeDef;
}

export type TTypeDef = IEnumDef | IInterfaceDef | IStructDef;

export interface IEnumDef extends ITypeDef {
  kind: 'enum';
  values: string[];
}
export interface IInterfaceDef extends ITypeDef {
  kind: 'interface';
  methods: IMethodDef[];
  implementedBy: string[];
}

export interface IStructDef extends ITypeDef {
  kind: 'struct';
  fields: IFieldDef[];
  methods: IMethodDef[];
  accessors: IAccesor[];
  private: IPrivateDef[];
  implements: string[];
}

export interface IFieldDef extends IDef {
  value: IValue;
  embedded: boolean;
  index: number;
}

export interface IMethodDef extends IDef {
  params: Array<{
    name: string;
    value: IValue;
  }>;
  returns: IValue;
}

export interface IAccesor {
  as: 'field' | 'method';
  struct: string;
  path: string[];
  def: IFieldDef | IMethodDef;
}

export interface IPrivateDef extends IDef {
  value: IValue;
  index: number;
}

export interface IValue {
  pointer: boolean;
  list: boolean;
  type: string;
  kind: string;
}

export interface IKindBox {
  enum: IEnumDef[];
  interface: IInterfaceDef[];
  struct: IStructDef[];
}

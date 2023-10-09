export type TypeOfName =
    | 'undefined'
    | 'boolean'
    | 'string'
    | 'number'
    | 'bigint'
    | 'symbol'
    | 'object'
    | 'function';

export type TypeFrom<TypeName extends TypeOfName> =
    TypeName extends 'undefined' ? undefined :
        TypeName extends 'boolean' ? boolean :
            TypeName extends 'string' ? string :
                TypeName extends 'number' ? number :
                    TypeName extends 'bigint' ? bigint :
                        TypeName extends 'symbol' ? symbol :
                            TypeName extends 'object' ? object | null :
                                TypeName extends 'function' ? (...args: any[]) => unknown : never;

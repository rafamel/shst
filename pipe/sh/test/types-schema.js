module.exports = {
  type: 'object',
  additionalProperties: false,
  required: ['types', 'funcs'],
  properties: {
    types: {
      type: 'object',
      additionalProperties: false,
      patternProperties: {
        '^.*$': {
          anyOf: [
            { $ref: '#/definitions/enumerable' },
            { $ref: '#/definitions/interface' },
            { $ref: '#/definitions/struct' }
          ]
        }
      }
    },
    funcs: {
      type: 'object',
      additionalProperties: false,
      patternProperties: {
        '^.*$': {
          type: 'object',
          additionalProperties: false,
          required: ['doc', 'type'],
          properties: {
            doc: { type: 'string' },
            type: {
              $ref: '#/definitions/typeFunction'
            }
          }
        }
      }
    }
  },
  definitions: {
    type: {
      anyOf: [
        { type: 'string' },
        { $ref: '#/definitions/typePointer' },
        { $ref: '#/definitions/typeList' },
        { $ref: '#/definitions/typeFunction' }
      ]
    },
    typePointer: {
      type: 'object',
      additionalProperties: false,
      required: ['kind', 'elem'],
      properties: {
        kind: { type: 'string', enum: ['pointer'] },
        elem: {
          anyOf: [
            { type: 'string' },
            { $ref: '#/definitions/typeList' },
            { $ref: '#/definitions/typeFunction' }
          ]
        }
      }
    },
    typeList: {
      type: 'object',
      additionalProperties: false,
      required: ['kind', 'elem'],
      properties: {
        kind: { type: 'string', enum: ['list'] },
        elem: {
          anyOf: [
            { type: 'string' },
            { $ref: '#/definitions/typePointer' },
            { $ref: '#/definitions/typeFunction' }
          ]
        }
      }
    },
    typeFunction: {
      type: 'object',
      additionalProperties: false,
      required: ['kind', 'params', 'results'],
      properties: {
        kind: { type: 'string', enum: ['function'] },
        params: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'type'],
            properties: {
              name: { type: 'string' },
              type: { $ref: '#/definitions/type' }
            }
          }
        },
        results: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'type'],
            properties: {
              name: { type: 'string' },
              type: { $ref: '#/definitions/type' }
            }
          }
        }
      }
    },
    enumerable: {
      type: 'object',
      additionalProperties: false,
      required: ['doc', 'type', 'enumvalues'],
      properties: {
        doc: { type: 'string' },
        type: { type: 'string', enum: ['uint32', 'int'] },
        enumvalues: {
          type: 'array',
          items: { type: 'string' }
        },
        methods: {
          type: 'object',
          additionalProperties: false,
          properties: {
            String: { type: 'object' }
          }
        }
      }
    },
    interface: {
      type: 'object',
      additionalProperties: false,
      required: ['doc', 'type', 'implementers'],
      properties: {
        doc: { type: 'string' },
        type: {
          type: 'object',
          additionalProperties: false,
          required: ['kind', 'methods'],
          properties: {
            kind: { type: 'string', enum: ['interface'] },
            methods: { $ref: '#/definitions/methods' }
          }
        },
        implementers: {
          type: 'array',
          items: { type: 'string' }
        },
        methods: {
          // If methods exists, should be empty for interface
          type: 'object',
          additionalProperties: false,
          properties: {}
        }
      }
    },
    struct: {
      type: 'object',
      additionalProperties: false,
      required: ['doc', 'type', 'methods'],
      properties: {
        doc: { type: 'string' },
        type: {
          type: 'object',
          additionalProperties: false,
          required: ['kind', 'fields'],
          properties: {
            kind: { type: 'string', enum: ['struct'] },
            fields: {
              type: 'object',
              additionalProperties: false,
              patternProperties: {
                '^.*$': {
                  type: 'object',
                  additionalProperties: false,
                  required: ['doc', 'type', 'embedded'],
                  properties: {
                    doc: { type: 'string' },
                    type: { $ref: '#/definitions/type' },
                    embedded: { type: 'boolean' }
                  }
                }
              }
            }
          }
        },
        methods: {
          $ref: '#/definitions/methods'
        }
      }
    },
    methods: {
      type: 'object',
      additionalProperties: false,
      patternProperties: {
        '^.*$': {
          type: 'object',
          additionalProperties: false,
          required: ['doc', 'type'],
          properties: {
            doc: { type: 'string' },
            type: {
              $ref: '#/definitions/typeFunction'
            }
          }
        }
      }
    }
  }
};

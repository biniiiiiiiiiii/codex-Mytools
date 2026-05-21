import type { JsonErrorDetail } from './json'
import { validateJson } from './json'

export type CSharpConverterOptions = {
  rootClassName: string
  namespace?: string
  useJsonPropertyName?: boolean
  detectDateTime?: boolean
}

export type CSharpConvertResult =
  | {
      ok: true
      output: string
    }
  | {
      ok: false
      error: JsonErrorDetail
    }

type TypeDescriptor =
  | PrimitiveDescriptor
  | ObjectDescriptor
  | ListDescriptor

type PrimitiveName = 'string' | 'int' | 'long' | 'decimal' | 'bool' | 'DateTime' | 'object'

type PrimitiveDescriptor = {
  kind: 'primitive'
  typeName: PrimitiveName
  nullable: boolean
}

type ObjectDescriptor = {
  kind: 'object'
  className: string
  nullable: boolean
  properties: PropertyDescriptor[]
  definition: PendingClass
}

type ListDescriptor = {
  kind: 'list'
  elementType: TypeDescriptor
  nullable: boolean
}

type PropertyDescriptor = {
  jsonKey: string
  propertyName: string
  type: TypeDescriptor
}

type PendingClass = {
  className: string
  properties: PropertyDescriptor[]
}

type BuildContext = {
  options: Required<Omit<CSharpConverterOptions, 'namespace'>> & Pick<CSharpConverterOptions, 'namespace'>
  usedClassNames: Set<string>
  classes: PendingClass[]
}

export function convertJsonToCSharp(
  input: string,
  options: CSharpConverterOptions,
): CSharpConvertResult {
  const validation = validateJson(input)
  if (!validation.valid) {
    return {
      ok: false,
      error: validation.error,
    }
  }

  const normalizedOptions = normalizeOptions(options)
  const parsedValue = JSON.parse(input) as unknown
  const context: BuildContext = {
    options: normalizedOptions,
    usedClassNames: new Set<string>(),
    classes: [],
  }

  const rootName = normalizeClassName(normalizedOptions.rootClassName)
  const rootType = inferRootType(parsedValue, rootName, context)

  if (rootType.kind !== 'object') {
    return {
      ok: false,
      error: {
        message: '根节点必须是 JSON 对象或对象数组。',
        hint: '请提供对象样本，或提供对象数组作为输入。',
      },
    }
  }

  return {
    ok: true,
    output: renderClasses(context),
  }
}

function normalizeOptions(options: CSharpConverterOptions) {
  return {
    rootClassName: options.rootClassName.trim() || 'Root',
    namespace: options.namespace?.trim() || '',
    useJsonPropertyName: options.useJsonPropertyName ?? false,
    detectDateTime: options.detectDateTime ?? false,
  }
}

function inferRootType(value: unknown, rootClassName: string, context: BuildContext): TypeDescriptor {
  if (isPlainObject(value)) {
    return inferObjectType(value, rootClassName, context)
  }

  if (Array.isArray(value)) {
    const itemClassName = singularize(rootClassName) || `${rootClassName}Item`
    const listType = inferArrayType(value, itemClassName, context)

    if (listType.elementType.kind === 'object') {
      return listType.elementType
    }
  }

  return primitive('object', false)
}

function inferType(value: unknown, suggestedName: string, context: BuildContext): TypeDescriptor {
  if (value === null) {
    return primitive('object', true)
  }

  if (typeof value === 'string') {
    if (context.options.detectDateTime && isIsoDateTime(value)) {
      return primitive('DateTime', false)
    }

    return primitive('string', false)
  }

  if (typeof value === 'number') {
    return inferNumberType(value)
  }

  if (typeof value === 'boolean') {
    return primitive('bool', false)
  }

  if (Array.isArray(value)) {
    return inferArrayType(value, suggestedName, context)
  }

  if (isPlainObject(value)) {
    return inferObjectType(value, suggestedName, context)
  }

  return primitive('object', false)
}

function inferObjectType(
  value: Record<string, unknown>,
  suggestedName: string,
  context: BuildContext,
): ObjectDescriptor {
  const className = reserveClassName(suggestedName, context.usedClassNames)
  const definition: PendingClass = {
    className,
    properties: [],
  }
  context.classes.push(definition)

  const propertyEntries = Object.entries(value)
  const properties = propertyEntries.map(([jsonKey, propertyValue]) => {
    const propertyName = normalizePropertyName(jsonKey)
    return {
      jsonKey,
      propertyName,
      type: inferType(propertyValue, singularize(propertyName) || propertyName, context),
    }
  })
  definition.properties = properties

  return {
    kind: 'object',
    className,
    nullable: false,
    properties,
    definition,
  }
}

function inferArrayType(value: unknown[], suggestedName: string, context: BuildContext): ListDescriptor {
  if (value.length === 0) {
    return {
      kind: 'list',
      elementType: primitive('object', false),
      nullable: false,
    }
  }

  const nonNullValues = value.filter((item) => item !== null)
  if (nonNullValues.length > 0 && nonNullValues.every((item) => isPlainObject(item))) {
    return {
      kind: 'list',
      elementType: inferObjectArrayType(
        nonNullValues as Record<string, unknown>[],
        singularize(suggestedName) || `${suggestedName}Item`,
        context,
        nonNullValues.length !== value.length,
      ),
      nullable: false,
    }
  }

  const elementDescriptors = value.map((item) =>
    inferType(item, singularize(suggestedName) || `${suggestedName}Item`, context),
  )

  return {
    kind: 'list',
    elementType: mergeDescriptors(elementDescriptors),
    nullable: false,
  }
}

function inferObjectArrayType(
  values: Record<string, unknown>[],
  suggestedName: string,
  context: BuildContext,
  nullable: boolean,
): ObjectDescriptor {
  const first = inferObjectType(values[0], suggestedName, context)

  for (const value of values.slice(1)) {
    const next = inferObjectShape(value, first.className, context)
    mergeObjectDescriptors(first, next)
  }

  return nullable ? { ...first, nullable: true } : first
}

function inferObjectShape(
  value: Record<string, unknown>,
  existingClassName: string,
  context: BuildContext,
): ObjectDescriptor {
  const definition: PendingClass = {
    className: existingClassName,
    properties: [],
  }

  const properties = Object.entries(value).map(([jsonKey, propertyValue]) => {
    const propertyName = normalizePropertyName(jsonKey)
    return {
      jsonKey,
      propertyName,
      type: inferType(propertyValue, singularize(propertyName) || propertyName, context),
    }
  })

  definition.properties = properties

  return {
    kind: 'object',
    className: existingClassName,
    nullable: false,
    properties,
    definition,
  }
}

function mergeDescriptors(descriptors: TypeDescriptor[]): TypeDescriptor {
  return descriptors.reduce((merged, current) => mergeTwoDescriptors(merged, current))
}

function mergeTwoDescriptors(left: TypeDescriptor, right: TypeDescriptor): TypeDescriptor {
  if (left.kind === 'primitive' && right.kind === 'primitive') {
    return mergePrimitiveDescriptors(left, right)
  }

  if (left.kind === 'object' && right.kind === 'object') {
    return mergeObjectDescriptors(left, right)
  }

  if (left.kind === 'list' && right.kind === 'list') {
    return {
      kind: 'list',
      elementType: mergeTwoDescriptors(left.elementType, right.elementType),
      nullable: left.nullable || right.nullable,
    }
  }

  if (isNullObjectPrimitive(left)) {
    return markNullable(right)
  }

  if (isNullObjectPrimitive(right)) {
    return markNullable(left)
  }

  return primitive('object', false)
}

function mergePrimitiveDescriptors(
  left: PrimitiveDescriptor,
  right: PrimitiveDescriptor,
): PrimitiveDescriptor {
  if (left.typeName === right.typeName) {
    return primitive(left.typeName, left.nullable || right.nullable)
  }

  if (left.typeName === 'object' || right.typeName === 'object') {
    return primitive('object', left.nullable || right.nullable)
  }

  const numericTypes = new Set<PrimitiveName>(['int', 'long', 'decimal'])
  if (numericTypes.has(left.typeName) && numericTypes.has(right.typeName)) {
    if (left.typeName === 'decimal' || right.typeName === 'decimal') {
      return primitive('decimal', left.nullable || right.nullable)
    }

    if (left.typeName === 'long' || right.typeName === 'long') {
      return primitive('long', left.nullable || right.nullable)
    }

    return primitive('int', left.nullable || right.nullable)
  }

  return primitive('object', left.nullable || right.nullable)
}

function mergeObjectDescriptors(left: ObjectDescriptor, right: ObjectDescriptor): ObjectDescriptor {
  const propertyMap = new Map<string, PropertyDescriptor>()

  for (const property of left.properties) {
    propertyMap.set(property.jsonKey, property)
  }

  for (const property of right.properties) {
    const existing = propertyMap.get(property.jsonKey)
    if (!existing) {
      propertyMap.set(property.jsonKey, {
        ...property,
        type: markNullable(property.type),
      })
      continue
    }

    propertyMap.set(property.jsonKey, {
      ...existing,
      type: mergeTwoDescriptors(existing.type, property.type),
    })
  }

  for (const property of left.properties) {
    if (!right.properties.some((candidate) => candidate.jsonKey === property.jsonKey)) {
      propertyMap.set(property.jsonKey, {
        ...property,
        type: markNullable(property.type),
      })
    }
  }

  const mergedProperties = Array.from(propertyMap.values())
  left.properties = mergedProperties
  left.definition.properties = mergedProperties

  return {
    ...left,
    properties: mergedProperties,
    nullable: left.nullable || right.nullable,
  }
}

function markNullable(descriptor: TypeDescriptor): TypeDescriptor {
  if (descriptor.kind === 'primitive') {
    return {
      ...descriptor,
      nullable: true,
    }
  }

  if (descriptor.kind === 'list') {
    return {
      ...descriptor,
      nullable: true,
    }
  }

  return {
    ...descriptor,
    nullable: true,
  }
}

function renderClasses(context: BuildContext) {
  const lines: string[] = []
  const needsCollections = context.classes.some((pendingClass) =>
    pendingClass.properties.some((property) => containsList(property.type)),
  )
  const needsJsonPropertyName = context.options.useJsonPropertyName

  if (needsCollections) {
    lines.push('using System.Collections.Generic;')
  }

  if (needsJsonPropertyName) {
    lines.push('using System.Text.Json.Serialization;')
  }

  if (lines.length > 0) {
    lines.push('')
  }

  if (context.options.namespace) {
    lines.push(`namespace ${context.options.namespace};`, '')
  }

  for (const pendingClass of context.classes) {
    lines.push(`public class ${pendingClass.className}`)
    lines.push('{')

    for (const property of pendingClass.properties) {
      if (context.options.useJsonPropertyName && property.jsonKey !== property.propertyName) {
        lines.push(`    [JsonPropertyName("${escapeString(property.jsonKey)}")]`)
      }

      lines.push(
        `    public ${renderType(property.type)} ${property.propertyName} { get; set; }`,
      )
      lines.push('')
    }

    if (lines[lines.length - 1] === '') {
      lines.pop()
    }

    lines.push('}', '')
  }

  if (lines[lines.length - 1] === '') {
    lines.pop()
  }

  return lines.join('\n')
}

function renderType(descriptor: TypeDescriptor): string {
  if (descriptor.kind === 'primitive') {
    const supportsNullableSuffix =
      descriptor.typeName !== 'string' && descriptor.typeName !== 'object'

    if (descriptor.nullable) {
      return supportsNullableSuffix ? `${descriptor.typeName}?` : `${descriptor.typeName}?`
    }

    return descriptor.typeName
  }

  if (descriptor.kind === 'object') {
    return descriptor.nullable ? `${descriptor.className}?` : descriptor.className
  }

  const elementType = renderType(descriptor.elementType)
  return descriptor.nullable ? `List<${elementType}>?` : `List<${elementType}>`
}

function containsList(descriptor: TypeDescriptor): boolean {
  if (descriptor.kind === 'list') {
    return true
  }

  if (descriptor.kind === 'object') {
    return descriptor.properties.some((property) => containsList(property.type))
  }

  return false
}

function reserveClassName(name: string, usedClassNames: Set<string>) {
  const baseName = normalizeClassName(name)
  let candidate = baseName
  let suffix = 2

  while (usedClassNames.has(candidate)) {
    candidate = `${baseName}${suffix}`
    suffix += 1
  }

  usedClassNames.add(candidate)
  return candidate
}

function normalizeClassName(value: string) {
  return pascalize(value || 'Root')
}

function normalizePropertyName(value: string) {
  return pascalize(value || 'Value')
}

function pascalize(value: string) {
  const normalized = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()

  const parts = normalized.split(/\s+/).filter(Boolean)
  const pascal = parts.map(capitalize).join('') || 'Value'
  const startsWithDigit = /^\d/.test(pascal)
  const candidate = startsWithDigit ? `Item${pascal}` : pascal

  return isCSharpKeyword(candidate) ? `${candidate}Model` : candidate
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function singularize(value: string) {
  if (value.endsWith('ies')) {
    return `${value.slice(0, -3)}y`
  }

  if (value.endsWith('ses')) {
    return value.slice(0, -2)
  }

  if (value.endsWith('s') && value.length > 1) {
    return value.slice(0, -1)
  }

  return value
}

function inferNumberType(value: number): PrimitiveDescriptor {
  if (!Number.isFinite(value)) {
    return primitive('decimal', false)
  }

  if (!Number.isInteger(value)) {
    return primitive('decimal', false)
  }

  if (value >= -2147483648 && value <= 2147483647) {
    return primitive('int', false)
  }

  return primitive('long', false)
}

function primitive(typeName: PrimitiveName, nullable: boolean): PrimitiveDescriptor {
  return {
    kind: 'primitive',
    typeName,
    nullable,
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNullObjectPrimitive(descriptor: TypeDescriptor) {
  return descriptor.kind === 'primitive' && descriptor.typeName === 'object' && descriptor.nullable
}

function isIsoDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}([tT ][\d:.+-Zz]+)?$/.test(value)) {
    return false
  }

  return !Number.isNaN(Date.parse(value))
}

function escapeString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function isCSharpKeyword(value: string) {
  return new Set([
    'Class',
    'Namespace',
    'Public',
    'Private',
    'Internal',
    'Protected',
    'String',
    'Int',
    'Long',
    'Decimal',
    'Bool',
    'Object',
    'List',
    'Event',
    'Params',
  ]).has(value)
}

import { GraphQLSchema, isListType, GraphQLObjectType, GraphQLNonNull, GraphQLList, isEnumType, OperationDefinitionNode, VariableDefinitionNode, FragmentDefinitionNode } from 'graphql';
import { PreResolveTypesProcessor, ParsedDocumentsConfig, BaseDocumentsVisitor, LoadedFragment, getConfigValue, SelectionSetProcessorConfig, SelectionSetToObject, DeclarationKind, DeclarationBlock, RawDocumentsConfig } from '@graphql-codegen/visitor-plugin-common';
import { MetaExplorerOperationVariablesToObject } from './mxp-operation-variables-to-object';
import { MetaExplorerDocumentsPluginConfig } from './config';
import { isNonNullType } from 'graphql';
import { MetaExplorerSelectionSetProcessor } from './mxp-selection-set-processor';
import autoBind from 'auto-bind';
import { pascalCase } from 'pascal-case';
import { MetaExplorerSelectionSetToObject } from './mxp-selection-set-handler';
import { MetaExplorerDeclarationBlock } from './utils';

import {
	AvoidOptionalsConfig,
	generateFragmentImportStatement,
	normalizeAvoidOptionals,
	wrapTypeWithModifiers,
} from '@graphql-codegen/visitor-plugin-common';
import { GraphQLOutputType} from 'graphql';

/* tslint:disable */

export interface MetaExplorerDocumentsParsedConfig extends ParsedDocumentsConfig {
	avoidOptionals: boolean;
	immutableTypes: boolean;
	noExport: boolean;
}

function getRootType(operation, schema) {
	switch (operation) {
		case 'query':
			return schema.getQueryType();
		case 'mutation':
			return schema.getMutationType();
		case 'subscription':
			return schema.getSubscriptionType();
	}
}

export class MetaExplorerDocumentsVisitor extends BaseDocumentsVisitor<MetaExplorerDocumentsPluginConfig, MetaExplorerDocumentsParsedConfig> {
	constructor(schema: GraphQLSchema, config: MetaExplorerDocumentsPluginConfig, allFragments: LoadedFragment[]) {
		super(
			config,
			{
			} as MetaExplorerDocumentsParsedConfig,
			schema
		);

		autoBind(this);

		const clearOptional = (str: string): string => {
			const prefix = this.config.namespacedImportName ? `${this.config.namespacedImportName}\.` : '';
			const rgx = new RegExp(`^${prefix}Maybe<(.*?)>$`, 'is');

			if (str.startsWith(`${this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : ''}Maybe`)) {
				return str.replace(rgx, '$1');
			}

			return str;
		};

		//todo: change this for KVL
		const wrapTypeWithModifiers = (baseType: string, type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>): string => {
			const prefix = this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '';
			if (isNonNullType(type)) {
				return clearOptional(wrapTypeWithModifiers(baseType, type.ofType));
			} else if (isListType(type)) {
				const innerType = wrapTypeWithModifiers(baseType, type.ofType);
				return `${prefix}Maybe<${this.config.immutableTypes ? 'ReadonlyArray' : 'Array'}<${innerType}>>`;
				// return `${prefix}Maybe<${this.config.immutableTypes ? 'ReadonlyArray' : 'Array'}<${innerType}>>`;
			} else {
				return `${prefix}Maybe<${baseType}>`;
			}
		};

		const processorConfig: SelectionSetProcessorConfig = {
			namespacedImportName: this.config.namespacedImportName,
			convertName: this.convertName.bind(this),
			enumPrefix: this.config.enumPrefix,
			scalars: this.scalars,
			formatNamedField: (name: string): string => (this.config.immutableTypes ? `readonly ${name}` : name),
			wrapTypeWithModifiers,
		};
		const processor = new (MetaExplorerSelectionSetProcessor)(processorConfig);
		this.setSelectionSetHandler(
			new MetaExplorerSelectionSetToObject(
				processor,
				this.scalars,
				this.schema,
				this.convertName.bind(this),
				this.getFragmentSuffix.bind(this),
				allFragments,
				this.config
				));
		const enumsNames = Object.keys(schema.getTypeMap()).filter((typeName) => isEnumType(schema.getType(typeName)));
		this.setVariablesTransformer(
			new MetaExplorerOperationVariablesToObject(this.scalars, this.convertName.bind(this), this.config.avoidOptionals, this.config.immutableTypes, this.config.namespacedImportName, enumsNames, this.config.enumPrefix, this.config.enumValues)
		);
		const BLOCK_SPLITTER = "öäü";
		this._declarationBlockConfig = {
			ignoreExport: this.config.noExport,
			blockWrapper: BLOCK_SPLITTER,
			blockTransformer: (block) => {
				const parts = block.split(BLOCK_SPLITTER);
				const rv = `${parts[0]}${parts[1]}${parts[2]}`;
				return rv;
			}
		};
	}

	private handleAnonymousOperation2(node) {
		const name = node.name && node.name.value;
		if (name) {
			return this.convertName(node, {
				useTypesPrefix: false,
			});
		}
		return this.convertName(this._unnamedCounter++ + '', {
			prefix: 'Unnamed_',
			suffix: '_',
			useTypesPrefix: false,
		});
	}

	public OperationDefinition(node: OperationDefinitionNode): string {
		const name = this.handleAnonymousOperation2(node);
		const operationRootType = getRootType(node.operation, this._schema);

		if (!operationRootType) {
			throw new Error(`Unable to find root schema type for operation type "${node.operation}"!`);
		}

		const selectionSet = this._selectionSetToObject.createNext(operationRootType, node.selectionSet);
		const visitedOperationVariables = this._variablesTransfomer.transform<VariableDefinitionNode>(node.variableDefinitions);
		const operationType: string = pascalCase(node.operation);
		//const operationTypeSuffix = this.getOperationSuffix(name, operationType);
		const operationTypeSuffix = this.config.dedupeOperationSuffix && name.toLowerCase().endsWith(operationType) ? '' : pascalCase(operationType);

		const operationResult = new MetaExplorerDeclarationBlock(this._declarationBlockConfig)
			.export()
			.asKind('const')
			.withName(
				this.convertName(name, {
					suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
				})
			)
			.withContent(selectionSet.transformSelectionSet()).string;

		const operationVariables = new MetaExplorerDeclarationBlock(this._declarationBlockConfig)
			.export()
			.asKind('const')
			.withName(
				this.convertName(name, {
					suffix: operationTypeSuffix + 'Variables',
				})
			)
			.withBlock(visitedOperationVariables).string;

		return [operationVariables, operationResult].filter(r => r).join('\n\n');
	}

	FragmentDefinition(node: FragmentDefinitionNode): string {
		const fragmentRootType = this._schema.getType(node.typeCondition.name.value) as GraphQLObjectType;
		const selectionSet = this._selectionSetToObject.createNext(fragmentRootType, node.selectionSet);
		const fragmentSuffix = this.getFragmentSuffix(node);

		return selectionSet.transformFragmentSelectionSetToTypes(
			node.name.value,
			fragmentSuffix,
			this._declarationBlockConfig
		);
	}

	protected getPunctuation(declarationKind: DeclarationKind): string {
		return ';';
	}
	public getFragmentSuffix(node: FragmentDefinitionNode | string): string {
		return this.getOperationSuffix(node, 'Fragment');
	}
	public getOperationSuffix(
		node: FragmentDefinitionNode | OperationDefinitionNode | string,
		operationType: string
	): string {
		const { omitOperationSuffix = false, dedupeOperationSuffix = false } = this.config as { [key: string]: any };
		const operationName = typeof node === 'string' ? node : node.name.value;
		return omitOperationSuffix
			? ''
			: dedupeOperationSuffix && operationName.toLowerCase().endsWith(operationType.toLowerCase())
				? ''
				: operationType;
	}
}

import { TypeScriptSelectionSetProcessor } from './ts-selection-set-processor';

export interface TypeScriptDocumentsPluginConfig extends RawDocumentsConfig {
  /**
   * @description This will cause the generator to avoid using TypeScript optionals (`?`) on types,
   * so the following definition: `type A { myField: String }` will output `myField: Maybe<string>`
   * instead of `myField?: Maybe<string>`.
   * @default false
   *
   * @exampleMarkdown
   * ## Override all definition types
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *  config:
   *    avoidOptionals: true
   * ```
   *
   * ## Override only specific definition types
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    avoidOptionals:
   *      field: true
   *      inputValue: true
   *      object: true
   * ```
   */
  avoidOptionals?: boolean | AvoidOptionalsConfig;
  /**
   * @description Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *  config:
   *    immutableTypes: true
   * ```
   */
  immutableTypes?: boolean;
  /**
   * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *  config:
   *    flattenGeneratedTypes: true
   * ```
   */
  flattenGeneratedTypes?: boolean;
  /**
   * @description Set the to `true` in order to generate output without `export` modifier.
   * This is useful if you are generating `.d.ts` file and want it to be globally available.
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    noExport: true
   * ```
   */
  noExport?: boolean;
  globalNamespace?: boolean;
}


export interface TypeScriptDocumentsParsedConfig extends ParsedDocumentsConfig {
	avoidOptionals: AvoidOptionalsConfig;
	immutableTypes: boolean;
	noExport: boolean;
}

export class AnotherDocumentsVisitor extends BaseDocumentsVisitor<
	TypeScriptDocumentsPluginConfig,
	TypeScriptDocumentsParsedConfig
	> {
	constructor(schema: GraphQLSchema, config: TypeScriptDocumentsPluginConfig, allFragments: LoadedFragment[]) {
		super(
			config,
			{
				noExport: getConfigValue(config.noExport, false),
				avoidOptionals: normalizeAvoidOptionals(getConfigValue(config.avoidOptionals, false)),
				immutableTypes: getConfigValue(config.immutableTypes, false),
				nonOptionalTypename: getConfigValue(config.nonOptionalTypename, false),
			} as TypeScriptDocumentsParsedConfig,
			schema
		);

		autoBind(this);

		const wrapOptional = (type: string) => {
			const prefix = this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '';
			return `${prefix}Maybe<${type}>`;
		};
		const wrapArray = (type: string) => {
			const listModifier = this.config.immutableTypes ? 'ReadonlyArray' : 'Array';
			return `${listModifier}<${type}>`;
		};

		const formatNamedField = (name: string, type: GraphQLOutputType | null): string => {
			const optional = !this.config.avoidOptionals.field && !!type && !isNonNullType(type);
			return (this.config.immutableTypes ? `readonly ${name}` : name) + (optional ? '?' : '');
		};

		const processorConfig: SelectionSetProcessorConfig = {
			namespacedImportName: this.config.namespacedImportName,
			convertName: this.convertName.bind(this),
			enumPrefix: this.config.enumPrefix,
			scalars: this.scalars,
			formatNamedField,
			wrapTypeWithModifiers(baseType, type) {
				return wrapTypeWithModifiers(baseType, type, { wrapOptional, wrapArray });
			},
		};
		const processor = new (config.preResolveTypes ? PreResolveTypesProcessor : TypeScriptSelectionSetProcessor)(
			processorConfig
		);
		this.setSelectionSetHandler(
			new SelectionSetToObject(
				processor,
				this.scalars,
				this.schema,
				this.convertName.bind(this),
				this.getFragmentSuffix.bind(this),
				allFragments,
				this.config
			)
		);
		const enumsNames = Object.keys(schema.getTypeMap()).filter(typeName => isEnumType(schema.getType(typeName)));
		this.setVariablesTransformer(
			new MetaExplorerOperationVariablesToObject(this.scalars, this.convertName.bind(this), true, this.config.immutableTypes, this.config.namespacedImportName, enumsNames, this.config.enumPrefix, this.config.enumValues)

		);
		this._declarationBlockConfig = {
			ignoreExport: this.config.noExport,
		};
	}

	public getImports(): Array<string> {
		return !this.config.globalNamespace
			? this.config.fragmentImports.map(fragmentImport => generateFragmentImportStatement(fragmentImport, 'type'))
			: [];
	}

	protected getPunctuation(declarationKind: DeclarationKind): string {
		return ';';
	}
/*
	protected applyVariablesWrapper(variablesBlock: string): string {
		const prefix = this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '';

		return `${prefix}Exact<${variablesBlock === '{}' ? `{ [key: string]: never; }` : variablesBlock}>`;
	}*/
}

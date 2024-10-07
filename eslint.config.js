// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
	{
		files: ["**/*.ts"],
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...tseslint.configs.stylistic,
			...angular.configs.tsRecommended,
		],
		processor: angular.processInlineTemplates,
		rules: {
			"no-empty": "off",
			"no-empty-function": "off",
			"semi": "warn",
			"quotes": [
				"warn",
				"double",
				{
					"allowTemplateLiterals": true
				}
			],
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/no-empty-interface": "off",
			"@typescript-eslint/naming-convention": [
				"error",
				{
					"selector": "default",
					"format": [
						"camelCase"
					],
					"leadingUnderscore": "allow",
					"trailingUnderscore": "allow"
				},
				{
					"selector": "import",
					"format": [
						"camelCase",
						"PascalCase"
					]
				},
				{
					"selector": "variable",
					"format": [
						"camelCase",
						"UPPER_CASE"
					],
					"leadingUnderscore": "allow",
					"trailingUnderscore": "allow"
				},
				{
					"selector": "typeLike",
					"format": [
						"PascalCase"
					]
				},
				{
					"selector": "enum",
					"format": [
						"PascalCase"
					]
				},
				{
					"selector": "enumMember",
					"format": [
						"PascalCase"
					]
				}
			],
			"@typescript-eslint/consistent-type-imports": "off",
			// "@typescript-eslint/no-extra-semi": "error",
			"no-extra-semi": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					"ignoreRestSiblings": true
				}
			],
			"@angular-eslint/directive-selector": [
				"error",
				{
					type: "attribute",
					prefix: "app",
					style: "camelCase",
				},
			],
			"@angular-eslint/component-selector": [
				"error",
				{
					type: "element",
					prefix: "app",
					style: "kebab-case",
				},
			]
		},
	},
	{
		files: ["**/*.html"],
		extends: [
			...angular.configs.templateRecommended,
			...angular.configs.templateAccessibility,
		],
		rules: {},
	}
);

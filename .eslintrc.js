module.exports = {
	"env": {
			"es6": true,
			"node": true,
			"mocha": true,
	},
	"extends": ["airbnb-typescript"],
  "parser": "typescript-eslint/parser",
  "parserOptions": {
    project: './tsconfig.json',
  },
	"globals": {
	},
	"rules": {
			// indentation
			"@typescript-eslint/indent": [ 2, 2 ],

			// spacing
			"@typescript-eslint/space-in-parens": [ 2, "always" ],
			"@typescript-eslint/template-curly-spacing": [ 2, "always" ], 
			"@typescript-eslint/array-bracket-spacing": [ 2, "always" ],
			"@typescript-eslint/object-curly-spacing": [ 2, "always" ],
			"@typescript-eslint/computed-property-spacing": [ 2, "always" ],
			"@typescript-eslint/no-multiple-empty-lines": [ 2, { "max": 1, "maxEOF": 0, "maxBOF": 0 } ],

			// strings
			"@typescript-eslint/quotes": [ 2, "double", "avoid-escape" ],

			// code arrangement matter
			"@typescript-eslint/no-use-before-define": [ 2, { "functions": false } ],
			
			// make it meaningful
			"@typescript-eslint/prefer-const": 1,
			"@typescript-eslint/func-names": 1,
			"@typescript-eslint/no-underscore-dangle": 0,
			"@typescript-eslint/no-else-return": 1,
			"@typescript-eslint/no-unused-vars": 1,
			"@typescript-eslint/no-param-reassign": 1,
			"@typescript-eslint/no-new": 1,
			"@typescript-eslint/no-restricted-globals": 1,
      "@typescript-eslint/prefer-destructuring": 1,
      "@typescript-eslint/max-len": [1, 120],
      "@typescript-eslint/consistent-return": 0, // middleware doesn't return
      
			// keep it simple
			"@typescript-eslint/complexity": [ 1, 10 ],
	}
}
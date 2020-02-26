module.exports = {
	"env": {
			"es6": true,
			"node": true,
			"mocha": true,
	},
	"extends": "airbnb-typescript",
  // "parser": "babel-eslint",
  "parserOptions": {
    project: './tsconfig.json',
  },
	"globals": {
	},
	"rules": {
			// indentation
			"indent": [ 2, 2 ],

			// spacing
			"space-in-parens": [ 2, "always" ],
			"template-curly-spacing": [ 2, "always" ], 
			"array-bracket-spacing": [ 2, "always" ],
			"object-curly-spacing": [ 2, "always" ],
			"computed-property-spacing": [ 2, "always" ],
			"no-multiple-empty-lines": [ 2, { "max": 1, "maxEOF": 0, "maxBOF": 0 } ],

			// strings
			"quotes": [ 2, "double", "avoid-escape" ],

			// code arrangement matter
			"no-use-before-define": [ 2, { "functions": false } ],
			
			// make it meaningful
			"prefer-const": 1,
			"func-names": 1,
			"no-underscore-dangle": 0,
			"no-else-return": 1,
			"no-unused-vars": 1,
			"no-param-reassign": 1,
			"no-new": 1,
			"no-restricted-globals": 1,
      "prefer-destructuring": 1,
      "max-len": [1, 120],
      "consistent-return": 0, // middleware doesn't return
      
			// keep it simple
			"complexity": [ 1, 10 ],
	}
}
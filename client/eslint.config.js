export default [
	{
	  files: ["src/**/*.{js,jsx,ts,tsx}"], // Adjust paths based on your project
	  languageOptions: {
		parserOptions: {
		  ecmaVersion: "latest",
		  sourceType: "module",
		},
	  },
	  rules: {
		"no-console": ["warn", { allow: ["warn", "error"] }],
	  },
	},
  ];
  
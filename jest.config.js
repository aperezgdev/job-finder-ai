/** @type {import('jest').Config} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/test"],
	testMatch: ["**/*.spec.ts"],
	moduleFileExtensions: ["ts", "js", "json"],
	moduleNameMapper: {
		"^uuid$": "<rootDir>/test/helpers/uuid.ts",
	},
	clearMocks: true,
};
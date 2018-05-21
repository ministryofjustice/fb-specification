# Form Builder Specifications

JSON Schemas defining Form Builder core components

## Specifications

Location

```
specifications/${name}/${name}.schema.json
```

### Definitions

Location

```
specifications/definition/${name}/${name}.definition.schema.json
```


## Specification examples

Examples for the schemas are JSON files located in a
data directory at the same level as the schema file.

Valid examples should be in

```
specifications/${name}/data/valid/
```

data.invalid/*.json

```
specifications/${name}/data/invalid/
```

## Validating schemas

These tests check that test data in a specification’s folder are validates against that schema.

Validate all the schemas

```
npm run test:schemas
```

Validate a single schema

```
node validate.js -s {name}
```

Validate a single file against a particular schema

From the *specification* root directory:
```
node validate.js -s {schema name} {file path}
```


## Validating  data

## Generating documentation

General documentation is located in the documentation directory.

Schemas that have a corresponding .schema.md file will have that content included in the schema’a documentation.

Data test files that have a corresponding .md file will be included in a spec's documentation as examples

1. Check out fb-documentation
2. node expandAll.js
3. cd fb-documentation
4. npm run build
5. Commit and push resulting changes

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

NB. All of the following commands should be run from the *fb-specification* root directory:

### Validate all the schemas

Check that test data in each specification’s directory validates against the corresponding schema.

```
npm run test:schemas
```

### Validating a single schema

This command will use the data in the specified schema’s examples directory

```
node validate.js -s {schemaName}
```

### Validating other files

Validate a single file or directory

```
node validate.js {path}
```

### Testing for invalidity

Pass the -i flag (or --invalid)

```
node validate.js {path} -i
```

### Other options for the command line validator

By default, all errors encountered are displayed. To show only the first error encountered, use the --n-a flag (or --no-allErrors)

```
node validate.js {path} --help
```


## Validating/linting data

```
npm run lint
```

this runs

- `lint:schemas`
- `lint:data`

which checks that the files are valid JSON

To format the JSON files

- `format:schemas`
- `format:data`



## Generating documentation

General documentation is located in the documentation directory.

Schemas that have a corresponding .schema.md file will have that content included in the schema’a documentation.

Data test files that have a corresponding .md file will be included in a spec's documentation as examples

1. Check out fb-documentation
2. node expandAll.js
3. cd fb-documentation
4. npm run build
5. Commit and push resulting changes

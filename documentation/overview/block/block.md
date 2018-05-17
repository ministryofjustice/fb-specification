---
layout: layout-pane.njk
title: Blocks
section: Overview
---

## What is a block?

A block is any JSON data object 

- defined against a JSON Schema definition that is derived from the block definition schema (or any other definition schema that is so derived).=
- that can be rendered by a corresponding template
- that can be hidden or shown through the mechanism of the `show` property

All pages, components and patterns are blocks.

The block definition 

- provides baseline properties for other definitions
- allows blocks to be defined inline or externally

## Block properties

### Required properties

All blocks (and by extension, pages, components, patterns and other definitions) must have these properties

- `_id`

  A unique identifier for the block
- `_type`

  - Provides the definition name to validate the block against
  - Provides the template name to use when rendering the block

### Optional properties

- `_isa`

  `_id` of another block that the block is based on and which it inherit properties from.

  Any properties defined in the block override those set in the referenced block.

  *TODO: Does the referenced block have to be external?*
- `show`

  Whether or not to display the block - by default it is true

  This property can either be a boolean or a condition.
  
  [Read more about conditions](/overview/logic) 


## Defining a block

When a block is nested within another block (for example, when a component is included in a page), it can either be defined inline or by reference using the `_isa` property.

*TODO: Does the referencing block need to include its _type?*

#### Inline block defintion

```
{
  "_id": "componentId",
  "_type": "text",
  "name": "fullname",
  "label": "Full name",
}
```

#### Block definition by reference (_isa)

```
{
  "_id": "componentId",
  "_type": "text",
  "_isa": "fullnameBase"
}
```

`fullnameBase.json`
```
{
  "_id": "fullnameBase",
  "_type": "text",
  "name": "fullname",
  "label": "Full name"
}
```

The above definitions (inline and by reference) are functionally equivalent.

#### Extending a block


```
{
  "_id": "newFullname",
  "_type": "text",
  "_isa": "fullnameBase",
  "name": "othername",
  "hint": "As it appears on your birth certificate"
}
```
When this definition is combined with the previous referenced block, the resulting block at runtime will be the following:

```
{
  "_id": "newFullname",
  "_type": "text",
  "_isa": "fullnameBase",
  "name": "othername",
  "label": "Full name",
  "hint": "As it appears on your birth certificate"
}
```

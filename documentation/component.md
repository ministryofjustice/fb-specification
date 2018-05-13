---
layout: layout-pane.njk
title: Components
---

Components are reusable parts of the user interface that have been made to support a variety of applications.

What’s an element?

A chunk of data defined against a JSON Schema definition

Can be defined inline or externally (see appendix)

All elements have these properties

- `_id`
- `_type`

`_type` provides:

- the name of the definition to val_idate an element against
- the name of the template to use to render the element

Additionally, all elements have these optional properties

- `_isa`

  The _id of another element to inherit properties from
- `show`

  Whether or not to display the element

… other properties

Example: An element of type ‘Text’ would have - link to appendix

```
{
  "_id": "foo",
  "_type": "Text",
  "label": "Full name",
  "hint": "As it appears on your birth certificate"
}
```

or

```
{
  "_id": "foo",
  "_type": "Text",
  "_isa": "fullname"
}

{
  "_id": "fullname-base",
  "_type": "BaseText",
  "name": "fullname",
  "label": "Full name",
  "hint": "As it appears on your birth certificate"
}

{
  "_id": "bar",
  "_type": "Text",
  "_isa": "fullname",
  "name": "othername"
}
```
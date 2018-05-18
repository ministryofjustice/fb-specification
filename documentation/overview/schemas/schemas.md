---
layout: layout-pane.njk
title: Schemas
section: Overview
---


Form Builder schemas are [JSON Schema](http://json-schema.org/) documents.

The schemas must have the following properties

- $id

  String

  Unique identifier for the schema conforming to the pattern `http://gov.uk/schema/vX.X.X/{schemaName}`
- _name

  String

  The unique name of the schema, also used as the name of the template for [blocks](/overview/block).

Additionally they can also have

- category

  Array.&lt;String&gt;

  Categories that the schema should match

---
layout: layout-pane.njk
title: Models
section: Overview
---

## Control names

All controls must have a name.

The name is used as the key/path to store the input in the user’s data against.

By default, control names are not namespaced.

## Model properties

- `model`

  The model/namespace to use for a control.

  It can be set on controls, checkbox items, fieldsets, groups and pages.

  It must be set if the block’s can have a `multiple` property and that property is set.
  
  Its value is propagated to any blocks contained within the block.
- `modelProtect`

  Whether or not to allow a block's name to be prefixed with any propagated `model` value


## Examples

In the following examples, properties other than `name`, `model`, `modelProtect`, `multiple` and `components` have been omitted for clarity.

```
{
  ...
  "name": "email"
}
=> name="email"
```

Default outcome when no model is set

```
{
  ...
  "name": "email",
  "model": "spouse"
}
=> name="spouse.email"
```

When the block’s model is set 

```
{
  ...
  "name": "email",
  "model": "child",
  "multiple": true
}
=> name="child[1]email"
(when child’s multipleInstanceCounter = 2)
```

When the block’s multiple is set

```
{
  ...
  "model": "father",
  "components": [
    {
      ...
      "name": "email"
    }
  ]
}
=> name="father.email"
```

When the block’s parent block has a model

```
{
  ...
  "model": "applicant",
  "components": [
    {
      ...
      "name": "email",
      "model": "home"
    }
  ]
}
=> name="applicant.home.email"
```

When the block’s model is set and the block’s parent block has a model too 

```
{
  ...
  "model": "proceedings",
  "components": [
    {
      ...
      "name": "email",
      "model": "defendant",
      "modelProtect" true
    }
  ]
}
=> name="defendant.email"
```

When the block’s parent block has a model, but the block’s modelProtect is set

The user-supplied data resulting from all these controls would be structured like this

```
{
  "email": "...",
  "spouse": {
    "email": "..."
  },
  child: [{
    ...
  }, {
    "email": "..."
  }],
  "father": {
    "email": "..."
  },
  "applicant": {
    "home": {
      "email": "..."
    }
  },
  "defendant": {
    "email": "..."
  }
}
```


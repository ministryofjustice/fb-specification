---
layout: layout-single-page-prose.njk
---

# Get started

## The basics

(NB. this does not apply to content pages)

A service is built out of pages.

Pages are built out of [components](/components) and [patterns](/patterns).

Each page is defined in its own json file.

Every service must have a start page and the user’s journey through the service is defined as a sequence of steps, each of which is a reference to a page.


### Basic example of a service

The following 3 files define a simple service that presents

- a start page
- a page that asks the user for their favourite planet
- a confirmation page that replays their answer

`pageStartExample.json`

```
{
  "_id": "pageStartExample",
  "_type": "pageStart",
  "url": "/",
  "heading": "Hello world service",
  "body": "This service collects the user’s favourite planet",
  "steps": [
    "pagePlanet",
    "confirmation"
  ]
}
```

`pagePlanet.json`

```
{
  "_id": "pagePlanet",
  "_type": "pageSingleQuestion",
  "url": "/planet",
  "items": [{
    "_id": "pagePlanet-planet",
    "_type": "text",
    "name": "planet",
    "label": "What is your favourite planet?"
  }]
}
```

`confirmation.json`

```
{
  "_id": "confirmation",
  "_type": "pageConfirmation",
  "url": "/confirmation",
  "heading": "Thank you",
  "body": "Your favourite planet is {planet}"
}
```


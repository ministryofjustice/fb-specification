---
layout: layout-pane.njk
title: Pages
---

Pages

Each page is defined in its own json file.

Each page must have a unique `_id`.

The name of the json file must be the page’s `_id` value suffixed with `.json`.

Every page must have the following properties at the very least:

- _id
- _type
- url

Most pages require

- heading

## Page types

### Start page

The starting point of a service

### Single question page

Default pattern for asking a user a single question

### Generic form page

Allows asking multiple questions on a page and for the inclusion of other content

### Flash card page

Show users important information that they need to know before continuing with their journey

### Check answers page

Let users check their answers before submitting information to a service

### Confirmation page

Let users know they’ve completed a transaction

### Content page

Generic content page



#### DUMPING GROUND

A page is just another type of element, albeit the top-level element

Needs a url

Needs some element[s]

We define a page

- What its url is
- What is the heading/title
- What content and field blocks it is composed of
- What validation the fields require
- Whether any of those blocks should not be displayed
- Whether the page should be not be displayed
- Whether any transactions / code should be run
- Whether is has any sub-pages
- Whether a specific page should come next (and under what circumstances)

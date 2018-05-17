---
layout: layout-pane.njk
title: The basics
section: Overview
---

## Service

*TODO: Insert Al's definition of a service here*

Configuration of a service is performed through the [Service data instance](/configuration/Service)

A service is built out of pages.

Every service must have a start page and the user’s journey through the service is defined as a sequence of steps, each of which is a reference to a page.


## Pages

Pages are built out of [components](/components) and [patterns](/patterns) which can be added to the page‘s `components` property.

Each page must be defined in its own json file.

Pages are rendered using the template that corresponds to the page type used.

[See available page types](/page)


## Components

Components are the fundamental reusable parts of the user interface that have been made to support a variety of applications.

Components come in the following basic categories

- content
- form controls
- grouping other components

[See available component types](/component)


## Patterns

Patterns are best practice design solutions for specific user-focused tasks.

eg. A National Insurance field as opposed to a standard text field

Patterns are higer-levelmostly composed from other components.

Patterns can be used

[See available pattern types](/pattern)


## Blocks

The block is the fundamental data type with which all others are made.

--explanation of blocks--

## Definitions

Definitions are base schemas that other schemas can be made from.

[See available definitions](/definition)
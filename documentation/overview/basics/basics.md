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

Pages can be standalone or form part of the [flow](/overview/flow) (the user’s journey through the service).

[Read more about pages and see available page types](/page)


## Components

Components are the fundamental reusable parts of the user interface that have been made to support a variety of applications.

Components come in the following basic categories

- content
- form controls
- grouping other components

[Read more about components and see available component types](/component)


## Patterns

Patterns are higher-order components (and usually composed from other components)
that provide best practice design solutions for specific user-focused tasks.

> eg. A National Insurance field as opposed to a standard text field

Patterns can be used anywhere components can be.

[Read more about patterns and see available pattern types](/pattern)


## Blocks

Pages, components and patterns are all blocks.

A block is a data object that can be rendered with a template corresponding to the block’s type.

The block is the fundamental data type from which all others are made, providing baseline properties.

[Read more about blocks](/overview/block)

## Definitions

Definitions are base schemas that other schemas can be made from.

[Read more about definitions](/definition)
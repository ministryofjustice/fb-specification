---
layout: layout-pane.njk
title: Data primer
section: Overview
---

Form Builder uses data to create more data that enables citizens to submit data to Government. 


### User data

The input entered by a citizen through a service.

This is [stored](/overview/storage#user-data) by the [Runner](/process/runner) as a [JSON instance](/glossay#instance).

When the citizen completes their journey, the Runner transfers the data to the [Submitter](/process/sunmitter) which sends it to its final destination.


### Service data

The instructions that define the actual questions to ask the citizen and the journey between those questions.

This data is created as a collection of [JSON instances](/glossay#instance) in the [Editor](/process/editor) using the [specification data](#specification-data).

This data is deployed (along with [environment-specific](/glossary#environemnt) data) by the [Publisher](/process/publisher)


### Specification data

This data provides the instructions how to create the [service data](#service-data).

It also details:

  - how to render the [Editor](/process/editor) UI
  - how and where to deploy the service
  - what other services to interact with
  - how to render the citizen-facing service
  - how to validate [user data](#user-data)
  - where to send the user data at the completion of the journey

This data is made up of [schemas](/glossary#schema), test [instances](/glossary#instance), documentation and templates and are stored in [specification modules](/overview/storage#specification-data)

### Analytics data

  - User input
  - User behaviour using the service
  - Service performance







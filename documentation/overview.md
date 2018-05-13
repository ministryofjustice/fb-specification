---
layout: layout-single-page-prose.njk
title: Overview
---

# Overview

## What is the technical approach?

We build a digital service by representing it as data.

By creating this data using consistent definitions (the build-time “logical” representation), we can then generate the service using generic frontend elements and backend components (the run-time  "physical instantiation") rather than through bespoke development. (WHY? Add link)

This approach is known as metadata-driven design. [a] metadata-driven [design][development model].



From the buildtime representation we generate a runtime representation.

Using this representation, a runner can map urls to the relevant page definition

When a user visits a url, the runner

- Checks that the page should be displayed
- Performs any necessary validation
- Performs any transaction / code
- Update instance representation
- Perform substitution of strings
- Pass instance representation to template renderer



### DUMPING GROUND


Service flow
As mentioned previously, a service is built out of pages.

Find the service entry point
That’s the first page

Does the page have subpages
Yes -> go to subpage
No -> Should the page have multiple instances?
Yes -> Is the current multiple instance higher than the max allowed?
No -> Go to self/n + 1
Yes


The next page is its first subpage
If the subpage has su
 



Build representation
Explanation of how we get from build-time to run-time
Runtime representation
Instance representation


The flow through the service is determined by starting with the start page and moving through step-by-step



Transactions would be described using a JSON based description language that refers to the model. They would be designed by expert designers using an interface that uses both a GUI and blocks of raw JSON to create the JSON file that describes the transaction.




Common reusable components
Other code goes to microservice APIs

Multiple instances
Page
Group
Field

I18N / Markdown
If property is marked as a ‘content’ string, it will be run through the provided i18n and markdown routines
Modification of instance



Glossary

Block
Page
PageGroup
Subpage

Action
Controller

[Logical] Flow - journey




Default components
Access to standard backend functionality is provided by configuration
Custom code
By default, we advocate a “no code” approach. Instead custom backend code is provide byt
We provide a method for configuring calls to microservices API endpoints and for processing the data received back from those calls

Implementations
As the inputs and outputs of each phase of the the Form Builder process are defined a

No code / low code
Show when
A/B Testing
Feature switching
Custom elements
Default elements
Default modules
API Calls
Custom functionality
Transformations
Routing/Targets/Destinations
Governance

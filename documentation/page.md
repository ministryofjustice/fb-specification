---
layout: layout-pane.njk
title: Pages
---

## Page instance requirements

Each page must be defined in its own json file.

Each page must have a unique `_id`.

The name of the json file must be the page’s `_id` value suffixed with `.json`.

*TODO: Create a generic page about data storage*

## Form page or standalone content page?

By default, a page is a form page 

A page is considered a standalone content page if it

- contains no form controls
- and is not part of a page flow 

A form page renders the same as a standalone content page, with following 2 additions

- A primary action button to submit the page
- A link back to the previous page in the flow (if any)


## Properties

In addition to [properties required by all blocks](/overview/block)

- `_id`
- `_type`

every page must have a

- `url`

  This determines the address at which the runner will render this page and handle input submitted to it.

  The `url` can be absolute or relative
  
  If relative, the url of any parent page will be used as a prefix.

  If relative and there is no parent page, then the prefix '/' will be used.

  *TODO: Pattern for replacements and param subsitution/extraction*

Most pages require a

- `heading`

## Additional props

Pages can have `_isa` and `show`. See [block](/overview/block) for details on these properties.

- `title`

  Page’s title - defaults to the page’s heading if not set
- `lede`

  Introductory text

- `content`

  Arbitrary content before the page’s components

- `components`

  Components to include in the page

- `extraComponents`

  Further omponents to include in the page (usually after the primary action button)

- `model`

  model value to copy to all the page’s components and steps.

  [More about the `model` property](/overview/model)

- `nextPage`

  Explicit location to redirect to. See [page flow](/overview/flow).

- `steps`

  References to pages that make a sub-flow from this page.

- `stepsShow`

  Condition determining whether the page’s steps should be shown or not.

  This is applied in addition to any conditions that apply to the individual step pages.

- `stepsHeading`

  Heading to display as section heading on the page’s step pages

- `sectionHeading`

  Explicit heading to display as a section heading.

  Overrides any stepsHeading value inherited from the parent page.

- `actionType`

  `continue` by default

- `action`

  External url to submit to

  *TODO: not necessary for now - also why just external? why not another page (by reference, natch) in the service?*


## Skipping pages

The conditions when a page is skipped are detailed in the [Skipping pages section of Page flow](/overview/flow).


## Sections

If a page has steps, it is implicitly a section.

However, this can be made explicit to the user, by setting `stepsHeading` which results in a section heading being displayed.

A page’s steps can be suppressed by setting `stepsShow`

*TODO: What about an empty page that redirects to the first step automatically?*


## Multiple instances - repeating pages

If the `multiple` property is set, then the `model` property must be set.

[More about `model` and related properties](/overview/model)

[More about `multiple` and related properties](/overview/multiple)

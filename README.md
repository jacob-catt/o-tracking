# Tracking module

Origami module for the FT tracking.

![ScreenShot](/resources/images/tracking_forwarder.svg)




# Usage

Tracking at the FT relies on the following concept:
```
A user uses one of our products (Website, WebApp, ePaper etc.)
|- A user has many visits
   |- A visit has many pages
      |- A page has many events
      |- A page has many links
```

Therefore, when you're thinking about when to use the below functions - and which one to use - think about these rules.
For example:
- Does the thing you want to track happen many times on a page (or could it) - such as moving to the next slide of a slideshow - use an `event`.
- Is it describing the page or the user, include it in the `init` or `page` function.




# Developers

## Installation

Add this to your dependencies in bower.json:
```
"dependencies": {
    "tracking-module": "http://git.svc.ft.com:8080/scm/track/o-tracking.git#>=0.0.9 < 1"
}
```

It's strongly advised to specify at least the major and minor version as a tag.


## Including in a product

### Template
*The template also relies on a Cut the Mustard check which MUST be adhered to if you are using both JS and non-JS versions.*

*Please avoid sending duplicate requests per page.*

`tracking.mustache` expects a `tracking` object, containing the following properties:
* tracking.domain - the domain of the tracking server
* tracking.queryString - the parameters and values below compiled into a query string format.

### JavaScript
```
var track = require('o-tracking');
```
Then call the init function with the parameters below.
```
track.init({ ...params... });
```
## Methods
* `init` - setup the component with some default values.
* `page` - track a page - called for you the first time using init.
* `link` - for tracking links. *TBC*
* `event` - for tracking events on a page.
* `log` - for arbitrary logging to Splunk.

## Parameters
Both JS and non-JS versions take the same parameters.

### Config
* `developer`: `true` / `false` Turn on developer mode - which logs to console more.
* `server`: `http://test.tracking.ft.com/` - Location of tracking server.

### Site
* `channel` : `desktop` / `html5` / `epaper` / `flipboard` - The product or channel

### Page
* `url`: `http://www.ft.com/home/uk` - The URL of the page, defaults to document.location
* `referrer`: `http://www.ft.com/home/uk` - The referrer, defaults to document.referrer
* `uuid`: `` - The UUID for the page.
* `pageSubsLevel`: `0` / `1` / `2` / `3`] - Subscription level of the page
* `siteMap`: `Sections.Front page` / `Sections.World` - The falcon sitemap term.
* `title`: `World business, finance, and political news from the Financial Times - FT.com` - Page title.
* `assetType`: `front` / `story` / `blog` / `video` / `section` / `page` - Asset type of the page.
* `edition`: `UK` / `USA` - Edition being looked at.
* `brand`: `` - The FT brand.
* `theme`: `` - The FT Theme
* `hurdle`: `hx` / `h1` / `h2` - The Barrier served.
* `error`: `4xx` / `5xx` / `5nn` - Is this an error page? What type?
* `searchQuery`: `` Internal (meaning onsite) search query.

### User
* `userID`: `` - A unique, persistent identifier for the user.
* `cohort`: `3` / `1` / `2` - The user's subscription level.
* `passportID`: `4009049153` - The user's passport ID.
* `country`: `GBR` - The user's country.
* `region`: `london` - The user's region.
* `metroArea`: `islington` - The user's area.

### Marketing
* `ftcamp`: `` - FT Camp parameter.
* `campaign`: `` - Campaign parameter.




# Contributing

The following will get you setup:
* Check out the code
* `npm install`
* `grunt`

The following grunt tasks are available:
* `grunt version` - bump a version number in all the files that need a version number changing.
* `grunt test` - Test the code against the test suite.


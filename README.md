# Chrome extensions

## Intention

It has been some time since my last extension (back then a Firefox add-on). The idea is that there is a task I want to automate on Confluence and it seems not possible using the API (or maybe just to difficult) given that I don't have any say on what the server does, or its configuration. Also, my access is remote and has to do with SSO and SAML. AFAIK, that makes the use of the Confluence API really twisted and convoluted, while, in reality, my idea is being able to click somewhere to automatically download a version of the page I can edit, check differences and update from a local file repository. That would allow me to use any editing tools I want, and avoid manually importing files. Let's see if it makes sense.

Otherwise, at least I will learn/practice how to link into the Chrome echosystem. 

To get there, let's follow the tutorial and the official documentation.

## A Tutorial
### First stop [https://developer.chrome.com/extensions/getstarted](https://developer.chrome.com/extensions/getstarted)

I just created a folder and the idea is to iterate and improve the extension following the tutorial and additional documentation, so that I end up with a Chrome extension which does exactly what I want.

This folder can be used directly as an extension when using 'Load Unpacked' in 'Developer mode' under the Extensions page.

Background scripts handle events like navigating to a new page, removing a bookmark, etc... (browser triggers).

Reload the exension via the extension management page (the refresh icon).

I'm not yet sure how does the icon in the toolbar works with the popup (the fact that it appears disabled or not). I imagine it is part of the popup interface behaviour, but will prefer reading about it.

### Next stop [https://developer.chrome.com/extensions/overview](https://developer.chrome.com/extensions/overview)
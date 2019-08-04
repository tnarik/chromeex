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

The background script is the extension event handler, it is said.

My extension doesn't need to modify or read the content of the page (I think). It should just activate when in the right domain and then:

1. Offer the option to download/sync the page
2. Indicate if the page was already sync'ed
3. Indicate if there is some mismatch (either the available page or the corresponding downloaded data is newer).

That is regarding the icon appearance. The actions against the page(s) should be:

1. Storing the list of pages supported/sync'ed/tracked
2. Obtain page data/update the page using the REST APIs

As options:

1. It should be possible to indicate which domain to manage (alternatively, which list of domains).

I'm currently trying to put some kind of skeleton together, but ideally I should inspect the [API reference](https://developer.chrome.com/extensions/api_index) so that I can choose the appropriate calls.

### A fixed ID during development, via a Private Key

A `key.pem` is generated, and the corresponding public key and calculated Id printed out for use.

The `key.pem.donotdistribute` name is to avoid having to remove/move it when using the unpacked extension while keeping the logs error free.

```
# create Private Key
2>/dev/null openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out key.pem.donotdistribute
# 'key' in manifest.json
2>/dev/null openssl rsa -in key.pem.donotdistribute -pubout -outform DER | openssl base64 -A
# extension ID
2>/dev/null openssl rsa -in key.pem.donotdistribute -pubout -outform DER |  shasum -a 256 | head -c32 | tr 0-9a-f a-p

# add to the manifest a 'key' : 'publicKey value'
```
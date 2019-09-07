// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let thingieStatus = 0;
let thingiesGotten = []
const syncSites = () => {
   chrome.runtime.sendNativeMessage('uk.co.lecafeautomatique.confla',
      { cmd: "getListSummary" },
      function(response) {
       if (response !== undefined) {
         thingiesGotten = response;
         chrome.storage.sync.set({sites: response}, null );
      } else {
         console.error(chrome.runtime.lastError);
      }
   })
}

const siteMark = (site) => {
   if ( site === undefined ){
      //if (t.url.indexOf('a') == -1) {
         chrome.browserAction.setIcon({path: {"16": "images/host_unknown.png"}})
         chrome.browserAction.setBadgeText({"text": ""}, null);
         chrome.browserAction.setPopup({popup: "popup.html"});
         thingieStatus = 0;
//      } else if ( site.localPath.length > 0 ) {
      } else if ( site.status === 3 ) {
         chrome.browserAction.setIcon({path: {"16": "images/host_tracked.png"}})
         //chrome.browserAction.setBadgeText({"text": `${t.url.indexOf('a')}`}, null);
         chrome.browserAction.setBadgeText({"text": "100"}, null);
         chrome.browserAction.setPopup({popup: "popup_tracked.html"});
         thingieStatus = site.status;
      } else {
         chrome.browserAction.setIcon({path: {"16": "images/host_partial.png"}})
         chrome.browserAction.setBadgeText({"text": "0"}, null);
         chrome.browserAction.setPopup({popup: "popup.html"});
         thingieStatus = site.status;
      }
}

chrome.extension.onConnect.addListener( port => {
   console.log("Connected .....");
   port.onMessage.addListener( msg => {
      console.log(msg);
      if ( msg.question === "known?") {
         let aa = thingiesGotten.find(s => s.url == msg.url) 
         siteMark(aa)

         if ( thingieStatus > 0 ) {
            //.filter(s => s.url == "https://auth0.com")
            //.find(s => s.url == "https://auth0.com")
            //if ( thingiesGotten.includes(msg.url) ) {
            //let aa = thingiesGotten.find(s => s.url == msg.url) 
            //siteMark(aa)
            if ( aa !== undefined ) {
               port.postMessage({response: "known",
                  status: thingieStatus,
                  site: {
                  username: "background_username", // aa.username,//
                  password: "background_password",
                  localPath: "/" // aa.localPath
               }})
            }
         } else {
            port.postMessage({response: "?"})
         }
      }
   });
})

chrome.runtime.onInstalled.addListener(function() {
   syncSites()
   // This is a one-time initialization (setting of values and adding the rules)
   // That means stored domain value changes are disregarded
   chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log("The color is green.");
   });
});

// Other event listeners should be registered here.
//
// It seems there is no webNavigation. ??? It just needed permissions.
//
//chrome.webNavigation.onCompleted.addListener(function() {
//   console.log("oohh, a tab loaded!");
//   console.log("matched URL")
//   chrome.browserAction.setIcon({path: {"16": "images/get_started16_grey.png"}})
//  
//}, {url: [{hostEquals : 'developer.chrome.com'}]});

//chrome.tabs.onUpdated.addListener(function(tab, info) {
//   console.log("TAB UPDATED")
//   console.log(tab)
//   console.log(info)
//   console.log(info.url)
//   chrome.tabs.get(tab, (t) => {
//      console.log(t)
//   })
//});

chrome.tabs.onActivated.addListener( data => {
   console.log(data)
   chrome.tabs.get(data.tabId, (t) => {
      console.log(t)
      let site = thingiesGotten.find(s => s.url == new URL(t.url).origin)
      siteMark(site)
   })
   
   chrome.tabs.onUpdated.addListener((tabId, changeInfo, t) => {
      //console.log(`updated ${tabId}`);
      //console.log(changeInfo)
      //console.log(t)
      if ( data.tabId == tabId ) {
         let site = thingiesGotten.find(s => s.url == new URL(t.url).origin)
         siteMark(site)
      }
   });
})

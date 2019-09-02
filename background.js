// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let thingiesGotten = []
const refresh = () => {
   chrome.runtime.sendNativeMessage('uk.co.lecafeautomatique.confla',
      { cmd: "getList" },
      function(response) {
       if (response !== undefined) {
         thingiesGotten = response;
      } else {
         console.error(chrome.runtime.lastError);
      }
   })
}

chrome.extension.onConnect.addListener( port => {
   console.log("Connected .....");
   port.onMessage.addListener( msg => {
      console.log(msg);
      if ( msg.question === "known?") {
         if ( thingiesGotten.includes(msg.url) ) {
            port.postMessage({response: "known"})
         }
      }
   });
})

chrome.runtime.onInstalled.addListener(function() {
   refresh()
   // This is a one-time initialization (setting of values and adding the rules)
   // That means stored domain value changes are disregarded
   chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log("The color is green.");
   });
   chrome.storage.sync.set({tracked_domain: 'developer.chrome.com'}, function() {
      console.log("domain tracked");
   });

   let thingies = [
      {
         url: 'developer.chrome.com',
         path: "path1"
      },
      {
         url: 'bombmagazine.org',
         path: "path2"
      }
   ]

   chrome.storage.sync.set({thingies: thingies}, function() {
      console.log("thingies added");
   });

   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      //chrome.browserAction.setBadgeText({"text": "1"}, null);
      chrome.storage.sync.get('tracked_domain', function(data) {
         console.log(data.tracked_domain);

         var rule_active = {
            conditions: [
               new chrome.declarativeContent.PageStateMatcher({
                  pageUrl: {hostEquals: data.tracked_domain}
               }),
               new chrome.declarativeContent.PageStateMatcher({
                  pageUrl: {hostEquals: "bombmagazine.org"}
               })
            ],
            actions: [
               //console.log("matched URL")
               //new chrome.declarativeContent.ShowPageAction()
            ]
         }

         chrome.declarativeContent.onPageChanged.addRules([rule_active]);
      });
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

chrome.tabs.onActivated.addListener((data) => {
   console.log(data)
   chrome.tabs.get(data.tabId, (t) => {
      console.log(t)
      if ( !thingiesGotten.includes(new URL(t.url).origin) ){
      //if (t.url.indexOf('a') == -1) {
         chrome.browserAction.setIcon({path: {"16": "images/get_started16_grey.png"}})
         chrome.browserAction.setBadgeText({"text": ""}, null);
      } else {
         chrome.browserAction.setIcon({path: {"16": "images/get_started16.png"}})
         chrome.browserAction.setBadgeText({"text": `${t.url.indexOf('a')}`}, null);
      }
   })
   //chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
   //   console.log(`updated ${tabId}`);
   //   console.log(changeInfo)
   //   console.log(tab)
   //});
})

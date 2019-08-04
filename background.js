// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
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
            actions: [new chrome.declarativeContent.ShowPageAction()]
         }

         chrome.declarativeContent.onPageChanged.addRules([rule_active]);
      });
   });
});

// Other event listeners should be registered here.
//
// It seems there is no webNavigation. ??? It just needed permissions.
//
chrome.webNavigation.onCompleted.addListener(function() {
   console.log("oohh, a tab loaded!");
}, {url: [{hostEquals : 'developer.chrome.com'}]});

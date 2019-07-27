// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
   chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log("The color is green.");
   });
   chrome.storage.sync.set({tracked_domain: 'developer.chrome.com'}, function() {
      console.log("domain tracked");
   });

   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.storage.sync.get('tracked_domain', function(data) {
         console.log(data.tracked_domain);

         chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
               pageUrl: {hostEquals: data.tracked_domain}
            })],
          actions: [new chrome.declarativeContent.ShowPageAction()]
         }]);
      });
   });
});

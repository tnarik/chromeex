'use strict';

let multilog = function(message) {
  // OS notification
  chrome.notifications.create('', {
    type: 'basic',
    iconUrl: 'images/get_started32.png',
    title: JSON.stringify(message),
    message: "bkg "+JSON.stringify(message)
  }, function(notificationId) {});
};

let thingiesGotten = []
const syncSites = () => {
   chrome.runtime.sendNativeMessage('uk.co.lecafeautomatique.confla',
      { cmd: "getListSummary" },
      response => 
        new Promise((resolve, reject) => {

       if (response !== undefined) {
         console.log(response)
         thingiesGotten = response.map(site => {
            return {
               url: site.url,
               regex: RegExp(`^${site.url}(/.*)?`),
               status: site.status
            } })
         //chrome.storage.sync.set(
         //   {sites: thingiesGotten.map(s => {return {url: s.url, status: s.status}})}, null );
          chrome.storage.local.set({thingiesGotten: thingiesGotten}, null)

          resolve(thingiesGotten);
      } else {
         console.error(chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
      }
   })
  )
}

const getThingies = () => {
  return new Promise( (resolve, reject) => {
    chrome.storage.local.get({'thingiesGotten': []}, result => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        thingiesGotten = result['thingiesGotten'].map(site => {
            return {
               url: site.url,
               regex: RegExp(`^${site.url}(/.*)?`),
               status: site.status
            } })

        resolve(thingiesGotten);
      }
    });
  });
}

const findSite = url => {
   //syncSites()
//   let found = (thingiesGotten === undefined) ? undefined: thingiesGotten
  return getThingies()
  .then( thingiesGotten => {
    console.log(thingiesGotten)
    let found = thingiesGotten
          .filter(s => s.regex.test(url) )
          .reduce((accum, current) => current.url.length > accum.url.length? current : accum, {url: ""})
    console.log(found)
    console.log(found.url)
    return found.url !== "" ? found : undefined
  })
}

const siteMark = (site, url) => {
   if ( site === undefined || site.url === "" ){
      //if (t.url.indexOf('a') == -1) {
      chrome.browserAction.setIcon({path: {"16": "images/host_unknown.png"}})
      chrome.browserAction.setBadgeText({"text": ""}, null);
       chrome.browserAction.setPopup({popup: "popup.html"});
//      } else if ( site.localPath.length > 0 ) {
   } else if ( site.status === 3 ) {
      chrome.browserAction.setIcon({path: {"16": "images/host_tracked.png"}})
      chrome.storage.sync.get({pages: {}}, result => {
        console.log("Fetching pages")
         chrome.browserAction.setBadgeText({"text": `${result.pages[site.url]? result.pages[site.url].length: 0}`}, null);
         if (result.pages[site.url] !== undefined && result.pages[site.url].includes(url)) {
             chrome.browserAction.setIcon({path: {"16": "images/page_tracked.png"}})
             chrome.browserAction.setPopup({popup: "popup_tracked.html"});
         }
      })

      //chrome.browserAction.setBadgeText({"text": `${t.url.indexOf('a')}`}, null);
      //chrome.browserAction.setBadgeText({"text": "100"}, null);
      //chrome.browserAction.setPopup({popup: "popup_tracked.html"});
      chrome.browserAction.setPopup({popup: ""});
      
   } else {
      chrome.browserAction.setIcon({path: {"16": "images/host_partial.png"}})
      chrome.browserAction.setBadgeText({"text": "0"}, null);
      chrome.browserAction.setPopup({popup: "popup.html"});
   }
}

chrome.extension.onConnect.addListener( port => {
   console.log("Connected .....");
   port.onMessage.addListener( msg => {
      console.log(msg);
      if ( msg.question === "known?") {
         let site = findSite(msg.url)
                  .then( site=> {

         siteMark(site, msg.url)

         // change for 'site' !== undefined && site.status != 0
         if ( site !== undefined && site.status > 0 ) {
            if ( site !== undefined ) {
               port.postMessage({response: "known",
                  status: site.status,
                  site: {
                  username: "background_username", // aa.username,//
                  password: "background_password",
                  localPath: "/" // aa.localPath
               }})
            }
         } else {
            port.postMessage({response: "?"})
         }
       })
      }
      if ( msg.question === "addSite?") {
        // Addition is in reality Addition OR Modification

         //let site = findSite(msg.site.url)
         //if ( site === undefined ) {
            multilog("adding Site")
            chrome.runtime.sendNativeMessage('uk.co.lecafeautomatique.confla',
               { cmd: "addSite", site: msg.site },
               function(response) {
                 if (response !== undefined) {
                   multilog("Received response on added site");
                   console.log(response);
                   syncSites()
                   let site = findSite(msg.site.url)
                                     .then( site=> {

                   siteMark(site, msg.site.url)
                 })
                 } else {
                   console.error(chrome.runtime.lastError);
                 }
                port.postMessage({response: "ok"})
            })
         //}
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

chrome.runtime.onSuspend.addListener(function() {
   multilog("Suspension in progress")
});

chrome.runtime.onSuspendCanceled.addListener(function() {
   multilog("Suspension CANCELLED")
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


chrome.tabs.onActivated.addListener( data => {
   console.log(data)
   chrome.tabs.get(data.tabId, (t) => {
      console.log(t)
      findSite(t.url)
                        .then( site=> {

      console.log(site)
      siteMark(site, t.url)
    })
   })
   
   chrome.tabs.onUpdated.addListener((tabId, changeInfo, t) => {
      //console.log(`updated ${tabId}`);
      //console.log(changeInfo)
      //console.log(t)
      if ( data.tabId == tabId ) {
         let site = findSite(t.url)
                           .then( site=> {

         siteMark(site, t.url)
       })
      }
   });
})

chrome.browserAction.onClicked.addListener(tab => {
   alert(`add page ${tab.url}`)
   let site = findSite(tab.url)
                  .then( site=> {

   chrome.storage.sync.get({pages: {}}, result => {
      let pages = result.pages[site.url] || []
      pages.push(tab.url)
      result.pages[site.url] = pages
      //result.pages.push(tab.url)
      chrome.storage.sync.set({pages: result.pages}, () => {

         // Sync the whole lot with the Native App
         chrome.runtime.sendNativeMessage('uk.co.lecafeautomatique.confla',
            { cmd: "pushPages", pages: result.pages },
            function(response) {
               if (response !== undefined) {
                  // synced
               } else {
                  console.error(chrome.runtime.lastError);
               }
         })

      });
   });
 })
})
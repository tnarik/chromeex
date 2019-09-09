//let changeColor = document.getElementById('changeColor');
let talk_native = document.getElementById('talk_native');
let new_conflu = document.getElementById('new_conflu');
let existing_conflu = document.getElementById('existing_conflu');


let baseurl = document.getElementById('baseurl');
let activeUrl = ""

//chrome.storage.sync.get('color', function(data) {
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute('value', data.color);
//});

new_conflu.style.display = 'block';

let multilog = function(message) {
  // Background page might not be active
  if ( chrome.extension.getBackgroundPage() !== undefined ) {
    chrome.extension.getBackgroundPage().console.log(message);
  }

  // OS notification
  chrome.notifications.create('', {
    type: 'basic',
    iconUrl: 'images/get_started32.png',
    title: JSON.stringify(message),
    message: "ext "+JSON.stringify(message)
  }, function(notificationId) {});

  // main tab
  chrome.tabs.query(
    {active: true, currentWindow: true},
    function(tabs) {
      chrome.tabs.executeScript(
        tabs[0].id,
        {code: "console.log('"+JSON.stringify(message)+"');"});
  });
};

//changeColor.onclick = function(element) {
//  chrome.extension.getBackgroundPage().console.log('changing Color');
//   let color = element.target.value;
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//      chrome.tabs.executeScript(
//         tabs[0].id,
//         {code: 'document.body.style.backgroundColor = "' + color + '";'});
//   });
//   chrome.notifications.create('', {
//    type: 'basic',
//    iconUrl: 'images/get_started32.png',
//    title: "changed Color",
//    message: 'yas!'
//   }, function(notificationId) {});
//};

const extractConfluenceBase = (andthen) => {
  multilog("doing the Confluence extraction dance")
  // Get the base url instead of the main URL: metadata confluence-base-url
  chrome.tabs.executeScript(
          {code: `try { document.querySelector("meta[name=\'confluence-base-url\']").getAttribute("content"); 
                  } catch(e) { window.location.origin
                  }`},
          results => {
              if(chrome.runtime.lastError === undefined) {
                console.log(results);
                console.log("got a result");
                activeUrl = results[0]
                baseurl.textContent = activeUrl
                andthen()
              }
          });
}


// Add Site should probably happen via the background (so background call first)
talk_native.onclick = function(element) {
  multilog('talk to native');

  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  let localPath = document.getElementById('localPath').value;

//  chrome.storage.sync.get({sites: []}, result => {
//    multilog(result.sites.length)
//    if ( result.sites.find(s => s.url == activeUrl ) ) {
//      multilog("Shouldn't be adding this, right?")
//    } else {
//      multilog("Should be a new add")
//    }
//    //chrome.storage.sync.set({psites: result.sites}, () => multilog('Added site') );
//  })

  var port = chrome.extension.connect({
    name: "Initial Communication From POPUP"
  });
  port.postMessage({question: "addSite?", site: {
        url: activeUrl,
        username: username,
        password: password,
        localPath: localPath
    }
  });
  port.onMessage.addListener(null);
};

// This is addition to the Synced storage only
/*
add_this.onclick = function(element) {
  multilog('adding a host => ');

  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  multilog(`username ${username} and password ${password}`)

  chrome.storage.sync.get('hosts', result => {
    hh = result.hosts || []
    multilog(hh)

    chrome.tabs.query(
        {active: true, currentWindow: true},
        tabs => {
            if ( result.hosts.includes(tabs[0].url) ) {
              new_conflu.style.display = 'none';
            } else {
              new_conflu.style.display = 'block';
              var u = tabs[0].url
              hh.push(u)
              chrome.storage.sync.s e t({hosts: hh}, function() {} );
              uu = new URL(u)
              multilog(`added ${uu.origin}`)
              multilog(`added ${uu.hostname}`)
              multilog(`added ${uu.pathname}`)
            }
    });
  })
};
*/

existing_conflu.onclick = element => {
  new_conflu.style.display = "block"
  //existing_conflu.style.display = "none"
}

extractConfluenceBase( () => {
  var port = chrome.extension.connect({
    name: "Initial Communication From POPUP"
  });
  multilog(activeUrl)

  port.postMessage({question: "known?", url: activeUrl});
  port.onMessage.addListener(msg => {
    console.log(msg);
    if (msg.response === "known") {
      // fill data
      document.getElementById('username').value = msg.site.username;
      document.getElementById('password').value = msg.site.password;
      document.getElementById('localPath').value = msg.site.localPath;
      multilog(msg.status)
      if ( msg.status == 3 ) {
        // site info completed
        new_conflu.style.display = "none"
        existing_conflu.style.display = "inline-block"
      } else {
        // site info missing (just known or partial)
        new_conflu.style.display = "block"
        existing_conflu.style.display = "none"
      }
    } else {
      // site info new
      new_conflu.style.display = "block"
      existing_conflu.style.display = "none"
    }
  })
})

let changeColor = document.getElementById('changeColor');
//let showFolder = document.getElementById('showFolder');
//let dload = document.getElementById('dload');
//let dload_dload = document.getElementById('dload_dload');
//let talk_app = document.getElementById('talk_app');
let talk_native = document.getElementById('talk_native');
//let add_this = document.getElementById('add_this');
let new_conflu = document.getElementById('new_conflu');
let existing_conflu = document.getElementById('existing_conflu');


let baseurl = document.getElementById('baseurl');
let activeUrl = ""

chrome.storage.sync.get('color', function(data) {
   changeColor.style.backgroundColor = data.color;
   changeColor.setAttribute('value', data.color);
});

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

changeColor.onclick = function(element) {
  chrome.extension.getBackgroundPage().console.log('changing Color');
   let color = element.target.value;
   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(
         tabs[0].id,
         {code: 'document.body.style.backgroundColor = "' + color + '";'});
   });
   chrome.notifications.create('', {
    type: 'basic',
    iconUrl: 'images/get_started32.png',
    title: "changed Color",
    message: 'yas!'
   }, function(notificationId) {});
};

//showFolder.onclick = function(element) {
//  multilog('foder shown');
//};

// The following approach creates the blob, and provides/click on a link for downloading
//dload.onclick = function(element) {
//  multilog('downloading');
//  var text = "Some sample text, as an exercise";
//  var file = new Blob([text], {type: 'text/plain'}); // but could even be 'somethingelse'
//  var url = URL.createObjectURL(file);
//  multilog(url);
//  var a = document.createElement("a");
//  a.href = url;
//  a.download = "sample.txt";
//  document.body.appendChild(a);
//  a.click();
//};


// This is a different way of triggering the download, via the 'downloads' API
//dload_dload.onclick = function(element) {
//  multilog('dload appendChild');
//
//  var text = "Some sample text, as an exercise";
//  var file = new Blob([text], {type: 'text/plain'}); // but could even be 'somethingelse'
//  var url = URL.createObjectURL(file);
//
//  chrome.downloads.download(
//    { url: url,
//      filename: "sample_using_downloads.txt",
//      saveAs: false },
//    function(id) {});
//};

// Chrome Apps was an idea but it is deprecated, so better move to fully native Apps (which can access the real filesystem)
//talk_app.onclick = function(element) {
//  multilog('talk to app');
//  chrome.runtime.sendMessage('njammkdfbnolefjpfnckcdcbgafjggkb', { launch: true });
//};

const extractConfluenceBase = (andthen) => {
  // Get the base url instead of the main URL: metadata confluence-base-url
  chrome.tabs.executeScript(
          {code: 'try{ document.querySelector("meta[name=\'confluence-base-url\']").getAttribute("content"); }catch(error){ window.location.origin}'},
          results => { 
              console.log(results);
              activeUrl = results[0]
              baseurl.textContent = activeUrl
              andthen()
          });
}


talk_native.onclick = function(element) {
  multilog('talk to native');


  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;

  chrome.storage.sync.get('test', result => {
    chrome.runtime.sendNativeMessage('uk.co.lecafeautomatique.confla',
      { cmd: "addSite", site: {
          site: activeUrl,
          username: username,
          password: password,
      } },
      //result.test,
      function(response) {
        if (response !== undefined) {
          console.log("Received " + response);
          console.log(response);
        } else {
          console.error(chrome.runtime.lastError);
        }
      })
  })
  /*
  //var port = chrome.runtime.connectNative('uk.co.lecafeautomatique.confla');
  chrome.storage.sync.get('test', result => {
    chrome.runtime.sendNativeMessage('uk.co.lecafeautomatique.confla',
      { cmd: "getList" },
      //result.test,
      function(response) {
        if (response !== undefined) {
          console.log("Received " + response);
          console.log(response);
        } else {
          console.error(chrome.runtime.lastError);
        }
      })
  })
  */
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
              chrome.storage.sync.set({hosts: hh}, function() {} );
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
  port.postMessage({question: "known?", url: activeUrl});
  port.onMessage.addListener(msg => {
    console.log(msg);
    if (msg.response === "known") {
      // fill data
      document.getElementById('username').value = msg.site.username;
      document.getElementById('password').value = msg.site.password;

      // hide 
      new_conflu.style.display = "none"
      existing_conflu.style.display = "inline-block"
      // show modification icon
    } else {
      new_conflu.style.display = "block"
      existing_conflu.style.display = "none"
    }
  })
})



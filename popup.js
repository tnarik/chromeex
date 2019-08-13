let changeColor = document.getElementById('changeColor');
let showFolder = document.getElementById('showFolder');
let dload = document.getElementById('dload');
let dload_dload = document.getElementById('dload_dload');
let talk_app = document.getElementById('talk_app');
let talk_native = document.getElementById('talk_native');

chrome.storage.sync.get('color', function(data) {
   changeColor.style.backgroundColor = data.color;
   changeColor.setAttribute('value', data.color);
});


let multilog = function(message) {
  // Background page
  //if ( chrome.extension.getBackgroundPage().console !== undefined ) {
    chrome.extension.getBackgroundPage().console.log(message);
  //}

  // OS notification
  chrome.notifications.create('', {
    type: 'basic',
    iconUrl: 'images/get_started32.png',
    title: message,
    message: "ext "+message
  }, function(notificationId) {});

  // main tab
  chrome.tabs.query(
    {active: true, currentWindow: true},
    function(tabs) {
      chrome.tabs.executeScript(
        tabs[0].id,
        {code: "console.log('"+message+"');"});
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

showFolder.onclick = function(element) {
  multilog('foder shown');
};

// The following approach creates the blob, and provides/click on a link for downloading
dload.onclick = function(element) {
  multilog('downloading');
  var text = "Some sample text, as an exercise";
  var file = new Blob([text], {type: 'text/plain'}); // but could even be 'somethingelse'
  var url = URL.createObjectURL(file);
  multilog(url);
  var a = document.createElement("a");
  a.href = url;
  a.download = "sample.txt";
  document.body.appendChild(a);
  a.click();
};

dload_dload.onclick = function(element) {
  multilog('dload appendChild');

  var text = "Some sample text, as an exercise";
  var file = new Blob([text], {type: 'text/plain'}); // but could even be 'somethingelse'
  var url = URL.createObjectURL(file);

  chrome.downloads.download(
    { url: url,
      filename: "sample_using_downloads.txt",
      saveAs: false },
    function(id) {});
};

talk_app.onclick = function(element) {
  multilog('talk to app');
  chrome.runtime.sendMessage('njammkdfbnolefjpfnckcdcbgafjggkb', { launch: true });
};

talk_native.onclick = function(element) {
  multilog('talk to native');

  //var port = chrome.runtime.connectNative('uk.co.lecafeautomatique.confla');
  chrome.storage.sync.get('test', result => {
    chrome.runtime.sendNativeMessage('uk.co.lecafeautomatique.confla',
      //{ text: "Hello" },
      result.test,
      function(response) {
        if (response !== undefined) {
          console.log("Received " + response);
          console.log(response);
        } else {
          console.error(chrome.runtime.lastError);
        }
      })
  })
};

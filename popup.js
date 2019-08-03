let changeColor = document.getElementById('changeColor');
let showFolder = document.getElementById('showFolder');

chrome.storage.sync.get('color', function(data) {
   changeColor.style.backgroundColor = data.color;
   changeColor.setAttribute('value', data.color);
});


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
  chrome.extension.getBackgroundPage().console.log('folder shown');
   chrome.notifications.create('', {
    type: 'basic',
    iconUrl: 'images/get_started32.png',
    title: "woop, woop",
    message: 'a notification from the extension'
   }, function(notificationId) {});
   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(
         tabs[0].id,
         {code: 'console.log("clicked on show Folder");'});
   });
};
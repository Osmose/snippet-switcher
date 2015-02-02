self.port.on('saveSnippets', function(snippetCode) {
    var openRequest = indexedDB.open('abouthome', {
        version: 1,
        storage: 'persistent'
    });

    openRequest.onsuccess = function (event) {
        var db = event.target.result;
        db.transaction('snippets', 'readwrite')
          .objectStore('snippets').put(snippetCode, 'snippets');
    };
});


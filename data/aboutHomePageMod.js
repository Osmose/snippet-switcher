document.addEventListener('AboutHomeLoadSnippetsCompleted', function(e) {
    self.port.emit('fetchSnippets');
});

document.addEventListener('AboutHomeLoadSnippetsSucceeded', function(e) {
    self.port.emit('fetchSnippets');
});

self.port.on('showSnippets', function(snippetCode) {
    showSnippets(snippetCode);
});

function showSnippets(snippetCode) {
    var snippetsElt = document.getElementById('snippets');

    // Injecting snippets can throw if they're invalid XML.
    try {
        snippetsElt.innerHTML = snippetCode;
        // Scripts injected by innerHTML are inactive, so we have to relocate them
        // through DOM manipulation to activate their contents.
        Array.forEach(snippetsElt.getElementsByTagName("script"), function(elt) {
            var relocatedScript = document.createElement("script");
            relocatedScript.type = "text/javascript;version=1.8";
            relocatedScript.text = elt.text;
            elt.parentNode.replaceChild(relocatedScript, elt);
        });
    } catch (ex) {
         // Bad content, continue to show default snippets.
         snippetsElt.innerHTML = '<div class="snippet"><p>Error displaying snippets.</p></div>';
    }
}



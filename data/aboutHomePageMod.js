document.addEventListener('AboutHomeLoadSnippetsCompleted', function(e) {
    self.port.emit('getPrefsForFetch');
});

document.addEventListener('AboutHomeLoadSnippetsSucceeded', function(e) {
    self.port.emit('getPrefsForFetch');
});

self.port.on('getPrefsForFetch', function(urlPieces) {
    // Parse out the current values for the default snippet URL.
    var updateUrl = document.documentElement.getAttribute('snippetsURL');
    var urlDefaults = parseSnippetUrl(updateUrl);

    var xhr = new XMLHttpRequest();
    xhr.timeout = 500;
    var url = buildSnippetUrl(urlPieces, urlDefaults);
    console.log('Fetching snippets from: ' + url);
    xhr.open('GET', url, true);
    xhr.onloadend = function() {
        if (xhr.status == 200) {
            showSnippets(xhr.responseText);
        }
    };
    xhr.send(null);
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

function buildSnippetUrl(pieces, defaults) {
    var np = Object.create(defaults);
    Object.keys(pieces).forEach(function(key) {
        if (pieces[key] !== '') {
            np[key] = pieces[key];
        }
    });

    var toJoin = [np.snippet_server, np.startpage_version, np.name, np.version,
                  np.appbuildid, np.build_target, np.locale, np.channel,
                  np.os_version, np.distribution, np.distribution_version];
    return toJoin.join('/') + '/';
}

function parseSnippetUrl(url) {
    var c = url.split('/');
    var server = c.slice(0, -11).join('/');
    c = c.slice(-11);
    return {
        snippet_server: server,
        startpage_version: c[0],
        name: c[1],
        version: c[2],
        appbuildid: c[3],
        build_target: c[4],
        locale: c[5],
        channel: c[6],
        os_version: c[7],
        distribution: c[8],
        distribution_version: c[9],
    };
}

const {Cu} = require('chrome');
const {Services} = Cu.import('resource://gre/modules/Services.jsm');
const AboutHome = Cu.import("resource:///modules/AboutHome.jsm", {});

var buttons = require('sdk/ui/button/action');
var data = require('sdk/self').data;
var pageMod = require('sdk/page-mod');
var simplePrefs = require('sdk/simple-prefs');
var preferencesService = require("sdk/preferences/service");
var Request = require("sdk/request").Request;


// Modify about:home to override default snippet loading behavior.
pageMod.PageMod({
    include: 'about:home',
    contentScriptFile: data.url('aboutHomePageMod.js'),
    onAttach: function(worker) {
        worker.port.on('fetchSnippets', function() {
            getSnippets(function(snippetCode) {
                worker.port.emit('showSnippets', snippetCode);
            });
        });
    }
});

// Create toolbar button for configuring the switcher.
var button = buttons.ActionButton({
    id: 'snippet-switcher-button',
    label: 'Configure about:home Snippet Switcher',
    icon: data.url('grill.svg'),
    onClick: openPreferences,
});

function openPreferences() {
    // Open preferences pane for this addon.
    var win = Services.wm.getMostRecentWindow('navigator:browser');
    win.BrowserOpenAddonsMgr('addons://detail/jid1-osXce2nIke5hMw%40jetpack/preferences');
}

function getSnippets(callback) {
    var updateUrl = AboutHome.AboutHomeUtils.snippetsURL;
    var urlDefaults = parseSnippetUrl(updateUrl);
    var url = buildSnippetUrl(simplePrefs.prefs, urlDefaults) + '?x=' + (new Date()).getTime();
    console.log('Fetching snippets from: ' + url);

    Request({
        url: url,
        onComplete: function(response) {
            if (response.status == 200) {
                callback(response.text);
            }
        },
    }).get();
}

function buildSnippetUrl(pieces, defaults) {
    var np = Object.create(defaults);
    Object.keys(pieces).forEach(function(key) {
        if (pieces[key] !== '') {
            np[key] = pieces[key];
        }
    });

    var toJoin = [np.snippet_server, np.startpage_version, np.browser_name,
                  np.version, np.appbuildid, np.build_target, np.locale,
                  np.channel, np.os_version, np.distribution,
                  np.distribution_version];
    return toJoin.join('/') + '/';
}

function parseSnippetUrl(url) {
    var c = url.split('/');
    var server = c.slice(0, -11).join('/');
    c = c.slice(-11);
    return {
        snippet_server: server,
        startpage_version: c[0],
        browser_name: c[1],
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

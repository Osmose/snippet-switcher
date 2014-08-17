const {Cu} = require('chrome');
const {Services} = Cu.import('resource://gre/modules/Services.jsm');

var buttons = require('sdk/ui/button/action');
var data = require('sdk/self').data;
var pageMod = require('sdk/page-mod');
var simplePrefs = require('sdk/simple-prefs');


// Modify about:home to override default snippet loading behavior.
pageMod.PageMod({
    include: 'about:home',
    contentScriptFile: data.url('aboutHomePageMod.js'),
    onAttach: function(worker) {
        worker.port.on('getPrefsForFetch', function() {
            worker.port.emit('getPrefsForFetch', simplePrefs.prefs);
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

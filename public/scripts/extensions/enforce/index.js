/*
Ideas:
 - Clean design of new ui
 - change select text versus options for playing: audio
 - cross fading between bgm / start a different time
 - fading should appear before end when switching randomly
 - Background based ambient sounds
    - import option on background UI ?
 - Allow background music edition using background menu
    - https://fontawesome.com/icons/music?f=classic&s=solid
    - https://codepen.io/noirsociety/pen/rNQxQwm
    - https://codepen.io/xrocker/pen/abdKVGy
*/

import { saveSettingsDebounced, Generate, event_types, eventSource } from "../../../script.js";
import { getContext, extension_settings } from "../../extensions.js";
export { MODULE_NAME };

const extensionName = "enforce";
const extensionFolderPath = `scripts/extensions/${extensionName}`;

const MODULE_NAME = 'Enforce';
const DEBUG_PREFIX = "<Enforce extension> ";

let enforcing = false;

//#############################//
//  Extension UI and Settings  //
//#############################//

const defaultSettings = {
    enabled: false,
    expected: "",
    continue_prefix: "",
    max_try: 1
}

function loadSettings() {
    if (extension_settings.enforce === undefined)
        extension_settings.enforce = {};

    if (Object.keys(extension_settings.enforce).length != Object.keys(defaultSettings).length) {
        Object.assign(extension_settings.enforce, defaultSettings)
    }

    $("#enforce_enabled").prop('checked', extension_settings.enforce.enabled);
    $("#enforce_expected").val(extension_settings.enforce.expected);
    $("#enforce_continue_prefix").val(extension_settings.enforce.continue_prefix);
}

async function onEnabledClick() {
    extension_settings.enforce.enabled = $('#enforce_enabled').is(':checked');
    saveSettingsDebounced();
}

async function onExpectedChange() {
    extension_settings.enforce.expected = $('#enforce_expected').val();
    saveSettingsDebounced();
}

async function onContinuePrefixChange() {
    extension_settings.enforce.continue_prefix = $('#enforce_continue_prefix').val();
    saveSettingsDebounced();
}

function enforceText() {
    if (!extension_settings.enforce.enabled)
        return;
    
    console.debug(DEBUG_PREFIX, extension_settings.enforce);
    const expected = extension_settings.enforce.expected
    const last_message = getContext().chat[getContext().chat.length-1].mes;

    if (expected == "") {
        console.debug(DEBUG_PREFIX, "expected is empty, nothing to enforce")
        return;
    }

    if (last_message.includes(expected)) {
        console.debug(DEBUG_PREFIX, "expected text found, nothing to do.");
        return;
    }

    if (enforcing) {
        console.debug(DEBUG_PREFIX, "Already attempted to enforce, nothing to do");
        enforcing = false;
        return;
    }
    
    enforcing = true;
    console.debug(DEBUG_PREFIX, "expected text not found injecting prefix and calling continue");
    getContext().chat[getContext().chat.length-1].mes += extension_settings.enforce.continue_prefix;
    Generate("continue");
}


//#############################//
//  Extension load             //
//#############################//

// This function is called when the extension is loaded
jQuery(async () => {
    const windowHtml = $(await $.get(`${extensionFolderPath}/window.html`));

    $('#extensions_settings').append(windowHtml);
    loadSettings();

    $("#enforce_enabled").on("click", onEnabledClick);
    $("#enforce_expected").on("change", onExpectedChange);
    $("#enforce_continue_prefix").on("change", onContinuePrefixChange);

    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, () => enforceText());
});

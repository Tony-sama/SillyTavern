/*
Ideas:
 - play blip sound following message like in Ace atorney
 - per character blip sound
 - variate pitch for more style
*/

import { saveSettingsDebounced, getRequestHeaders } from "../../../script.js";
import { getContext, extension_settings, ModuleWorkerWrapper } from "../../extensions.js";

const extensionName = "audio";
const extensionFolderPath = `scripts/extensions/${extensionName}`;

const DEBUG_PREFIX = "<Audio:blip module> ";
const UPDATE_INTERVAL = 100;

const ASSETS_BLIP_FOLDER = "blip";
const BLIP_DURATION = 100;

let last_message = {name:null, message:null};

function playBlipSound() {
    $("#audio_blip")[0].play();
}

//#############################//
//  Extension UI and Settings  //
//#############################//

function loadSettings() {
    
}

//#############################//
//  API Calls                  //
//#############################//


//#############################//
//  Module Worker              //
//#############################//

/*
    - Update ambient sound
    - Update character BGM
        - Solo dynamique expression
        - Group only neutral bgm
*/
async function moduleWorker() {
    const moduleEnabled = extension_settings.audio.enabled;

    if (moduleEnabled) {
        let current_message = getContext().chat.slice(-1)[0];
        current_message = {name: current_message.name, message:current_message.mes};
        //console.debug(DEBUG_PREFIX,current_message);

        // User message
        if (current_message.name == getContext().name1 || current_message.name == "SillyTavern System")
            return;

        if (current_message.name != last_message.name || current_message.message != last_message.message) {
            console.debug(DEBUG_PREFIX, "New message detected from",current_message);
            // TODO do the audio blip
            const blipDuration = $("#audio_blip")[0].duration * 1000;
            const last_message_dom = $( ".last_mes").children(".mes_block").children(".mes_text").children("p");
            console.debug(DEBUG_PREFIX,last_message_dom);

            const delay = ms => new Promise(res => setTimeout(res, ms));

            if (isNaN(blipDuration ))
                return;

            last_message_dom.text("");
            last_message = current_message;
            for(const i in current_message.message) {
                if (current_message.message != last_message.message)
                    return;
                if (current_message.message[i] != " "){
                    $("#audio_blip")[0].play();
                    await delay(blipDuration);
                    last_message_dom.text(last_message_dom.text()+current_message.message[i]);
                    //setTimeout(playBlipSound, blipDuration*i);
                    //console.debug(DEBUG_PREFIX,blipDuration*i);
                }
                else
                    last_message_dom.text(last_message_dom.text()+" ");
            }
        }


    }
}

//#############################//
//  Extension load             //
//#############################//

// This function is called when the extension is loaded
jQuery(async () => {
    const wrapper = new ModuleWorkerWrapper(moduleWorker);
    setInterval(wrapper.update.bind(wrapper), UPDATE_INTERVAL);
    moduleWorker();
});

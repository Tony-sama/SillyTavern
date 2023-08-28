/*
Ideas:
 - play blip sound following message like in Ace atorney
 - per character blip sound
 - variate pitch for more style
 Refs:
 - https://golen.nu/portal/phoenix/script.js
*/

import { saveSettingsDebounced, getRequestHeaders } from "../../../script.js";
import { getContext, extension_settings, ModuleWorkerWrapper } from "../../extensions.js";

const extensionName = "audio";
const extensionFolderPath = `scripts/extensions/${extensionName}`;

const DEBUG_PREFIX = "<Audio:blip module> ";
const UPDATE_INTERVAL = 100;

const ASSETS_BLIP_FOLDER = "blip";
const BLIP_DURATION = 50;

const SPEED_SLOW = 0.09;
const SPEED_NORMAL = 0.06;
const SPEED_FAST = 0.04;

const COMMA_DELAY = 0.25;
const PHRASE_DELAY = 0.5;

let last_message = {name:null, message:null};


const delay = s => new Promise(res => setTimeout(res, s*1000));

function playSound() {
    $("#audio_blip")[0].pause();
    $("#audio_blip")[0].currentTime = 0;
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
            const last_message_dom = $( ".last_mes").children(".mes_block").children(".mes_text").children("p");
            console.debug(DEBUG_PREFIX,last_message_dom);

            last_message_dom.text("");
            last_message = current_message;
            $("#audio_blip").prop("volume",0.1);
            let blipDuration = SPEED_SLOW; //$("#audio_blip")[0].duration * 1000;
            for(const i in current_message.message) {
                if (current_message.message != last_message.message)
                    return;
                const next_char = current_message.message[i]

                if (next_char == ' ') {
                }
                else if (next_char == ',') {
                    await delay(COMMA_DELAY);
                }
                else if (["!","?","."].includes(next_char)) {
                    playSound();

                    if (blipDuration == SPEED_SLOW)
                        blipDuration = SPEED_NORMAL;
                    else
                    if (blipDuration == SPEED_NORMAL)
                        blipDuration = SPEED_FAST;
                    else
                        blipDuration = SPEED_SLOW;
                    
                    await delay(PHRASE_DELAY);
                    
                }
                else {
                    playSound();
                }
                
                await delay(blipDuration);
                last_message_dom.text(last_message_dom.text()+current_message.message[i]);
                    //$("#audio_blip")[0].play();
                    
                    //setTimeout(playBlipSound, blipDuration*i);
                    //console.debug(DEBUG_PREFIX,blipDuration*i);
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

// ==UserScript==
// @name         RMIT Canvas Dark Mode
// @version      0.5
// @description  Dark mode on RMIT's Canvas web app
// @author       Chameleon
// @include      http*://*rmit.instructure.com/*
// @grant        none
// ==/UserScript==

// Make a list of css selectors that should be switched back to normal colours - put it at the top of the file so it's easy to add to later
var unDarkMode=[
    '.ic-app-header__logomark-container',
    '.avatar',
    '.video-content-container',
    'img',
    'video',
    '.ic-DashboardCard__header_image'
];

(function() {
    'use strict';

    var hue=getSavedHue();

    // Create a new 'style' element
    var style=document.createElement('style');
    // Add it to the html head
    document.head.appendChild(style);
    // Give the style element an id so that we can mess with it when the user wants to customise the hue
    style.id='DarkModeStyle';
    // As changing the hue is something that both the startup code and the dynamic changing of the hue wants to use, put it in its own function
    changeHue(hue);

    // Make a link to initiate the hue selection slider
    var a=document.createElement('a');
    // Give it some text
    a.innerHTML='Dark Mode';
    // Style it so that it looks like a button in the top right
    a.setAttribute('style', 'position: absolute; z-index:100; top:10px; right:10px; border-radius:5px; background:rgba(128,128,255,0.7); color:white; cursor:pointer; padding:5px;');
    // Add the button to the body of the page
    document.body.appendChild(a);
    // Run the 'changeHueDialog' function when the button is clicked
    a.addEventListener('click', changeHueDialog);
})();

// Return the saved hue value or the default of 180 if there isn't one
function getSavedHue()
{
    // Find the saved hue value...
    var hue=parseInt(window.localStorage.DarkModeHue)
    // If there is no saved hue value set a default of 180 - isNaN is 'is Not a Number'
    if(isNaN(hue))
    {
        hue=180;
    }
    // Return it
    return hue;
}

// Create a dialog to dynamically change the hue of colours on the page
function changeHueDialog()
{
    // We only want the dialog to show once so find it by its id if it exists
    var dialog=document.getElementById('DarkModeDialog');
    // If the dialog doesn't exist...
    if(!dialog)
    {
        // ... create it
        dialog=document.createElement('div');
        // Give it an id so that we can find it if the button is pressed again while it is still open
        dialog.id='DarkModeDialog';
        // Style it so that it is an overlay
        dialog.setAttribute('style', 'position:fixed; top:30px; z-index:4000; width:80%; margin:auto; left:0; right:0; border-radius:5px; padding:10px; background:rgba(128,128,128,0.8); text-align:center;');
        // Add the dialog to the body of the page
        document.body.appendChild(dialog);
    }
    // Clear the dialog
    dialog.innerHTML='';
    // Get the initial hue value
    var hue=getSavedHue();
    // Create an input
    var slider=document.createElement('input');
    // Make it a slider and give it a min, max, and value
    slider.type='range';
    slider.min='1';
    slider.max='360';
    slider.value=hue;
    // Have it call the sliderChanged function when its value changes and pass in the slider element as the first argument (set `this` inside the function to undefined)
    slider.addEventListener('input', sliderChanged.bind(undefined, slider));
    // Style the slider so that it takes up the whole width
    slider.setAttribute('style', 'width:100%;');
    // Add the slider to the dialog
    dialog.appendChild(slider);

    // Create a button to close the dialog
    var a=document.createElement('a');
    // Give it some text
    a.innerHTML='[Close]';
    // Add a linebreak to the dialog
    dialog.appendChild(document.createElement('br'));
    // Add the close button to the dialog
    dialog.appendChild(a);
    // Make the close button remove the dialog from the page when it is clicked
    a.addEventListener('click', function(dialog) { dialog.parentNode.removeChild(dialog); }.bind(undefined, dialog));
    // Give it a 'pointer' when the mouse hovers it
    a.style.cursor='pointer';
}

// Save the new hue and then update the style
function sliderChanged(slider)
{
    window.localStorage.DarkModeHue=slider.value;
    changeHue(slider.value);
}

// Change the style to the new hue
function changeHue(hue)
{
    // Get the style element by the id that was set
    var style=document.getElementById('DarkModeStyle');
    // Set inverseHue to the number required to get back to normal colours
    var inverseHue=360-hue;
    // Add a style rule to invert the top level html element (which inverts everything on the page) and also spin the hue
    style.innerHTML='html { filter: invert(1) hue-rotate('+hue+'deg); }\n';
    // Join the list with a comma separator and mathematically undo the darkmode inversion
    style.innerHTML+=unDarkMode.join(', ')+' { filter: invert(1) hue-rotate('+inverseHue+'deg); }\n';
}

// ==UserScript==
// @name         RMIT Canvas This Post links
// @version      0.1
// @description  In discussions on Canvas posts don't have links to themselves which is inconvenient to share them. This adds them.
// @author       Chameleon
// @match        http*://*rmit.instructure.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // Check if the page we're on has at least one element with the 'discussion-section' class...
  if(document.getElementsByClassName('discussion-section').length==0)
  {
    // ... And if it doesn't we exit the function (and the script) without doing anything...
    return;
  }

  // ... If it does we run the addLinks function
  addLinks();
})();

function addLinks()
{
  // Canvas dynamically loads the discussion entries, so we get a list of the entries...
  let entries=document.getElementsByClassName('entry');
  // ... And check if there aren't any on the page yet...
  if(entries.length==0)
  {
    // ... If there aren't, we queue up the addLinks function to run again in half a second...
    // (There is a slight issue that means on a new discussion without any posts legitimately this userscript will check the page every half a second forever, but that's fine, it isn't hurting anything)
    window.setTimeout(addLinks, 500);
    // ... And exit the addLinks function without doing anything else
    return;
  }
  // At this point we have a list of entries to add links to, so we loop over every entry
  for(var i=0; i<entries.length; i++)
  {
    // Just in case anything goes wrong and crashes in the next bit we catch the error so that we can get the rest of the posts even if one breaks (see 'catch' comment down near the bottom)
    try
    {
      // Just a shortcut variable because I use the data at 'entries[i]' more than once (just my personal coding style preference)
      let e=entries[i];
      // Each entry element has an id in the form of 'entry-<id>' and we want the post id to add to our link, so we split the e elements id by 'entry-' and take the second part of the split which is just the post id we want
      let id=e.id.split('entry-')[1];
      // The three dots dropdown menu has a class of 'al-options', and it's the first element of that class ([0]), and that's where we want to add the new link we'll be making
      let options=e.getElementsByClassName('al-options')[0];
      // Deleted posts don't have three dots menus, they aren't shown to the user (mostly?) but they still show up in the page...
      if(!options)
      {
        // ... If there isn't a three dots menu we just continue on to the next discussion post/entry
        continue;
      }
      // We make our own list entry (the options element is a list)...
      let li=document.createElement('li');
      // ... And give it the HTML that makes a link to the current entry's post...
      li.innerHTML="<a href='#entry-"+id+"'>This Post</a>";
      // ... And then add the list entry to the options list
      options.appendChild(li);
      // This is where we catch the error that we might get; we hopefully don't care about the post that we missed if we miss one but we put the entry and the error to the web console so that someone who knows what they're
      //   doing can see what went wrong
    } catch(e) { console.log(entries[i]); console.log(e); }
  }
  // At this point we're all done, all valid posts should have This Post links
}
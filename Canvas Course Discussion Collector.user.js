// ==UserScript==
// @name         Canvas Course Discussion Collector
// @version      0.1
// @description  Add all of the Discussion posts from your courses and groups to the dashboard of Canvas
// @author       Chameleon
// @match        http*://*rmit.instructure.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

  var div=document.createElement('div');
  document.getElementById('content').appendChild(div);
  div.innerHTML=`
<div class="ic-dashboard-app">
  <div class="ic-Dashboard-header">
    <div class="large ic-Dashboard-header__layout">
      <h1 class="ic-Dashboard-header__title">
        <span class="hidden-phone">Discussions</span>
      </h1>
      <div class="ic-Dashboard-header__actions">
        <a href="javascript:void(0);" id="reload_discussions">⟳</a>
      </div>
    </div>
  </div>
  <div style="display: block;">
    <div id="discussionsDiv" class="ic-DashboardCard__box">
    </div>
  </div>
</div>
  `;

  document.getElementById('reload_discussions').addEventListener('click', updateDiscussions);
  updateDiscussions();
})();

function status(response)
{
  if(response.status >= 200 && response.status < 300)
  {
    return Promise.resolve(response);
  }
  else
  {
    return Promise.reject(new Error(response.statusText));
  }
}

function parseJson(data)
{
  return JSON.parse(data.split("while(1);")[1]);
}

function byLastPostDate(a, b)
{
  return new Date(b.last_reply_at) - new Date(a.last_reply_at);
}

function updateDiscussions()
{
  var div=document.getElementById('discussionsDiv');
  div.innerHTML='';

  var all=window.ENV.STUDENT_PLANNER_COURSES.concat(window.ENV.STUDENT_PLANNER_GROUPS);

  for(var i=0; i<all.length; i++)
  {
    var c=all[i];
    var id=c.id;
    var nDiv=document.createElement('div');
    nDiv.id="discussions_"+id;
    var type=c.assetString.split('_')[0]=="course"?"courses":"groups";
    nDiv.innerHTML=`<h2>${c.shortName?c.shortName:c.name}</h2>`;
    div.appendChild(nDiv);
    nDiv.setAttribute('style', 'display:inline-block; width:24%; padding:5px; text-overflow:ellipsis; vertical-align:top;');
    fetch("https://rmit.instructure.com/api/v1/"+type+"/"+id+"/discussion_topics?exclude_assignment_descriptions=true&exclude_context_module_locked_topics=true&include_assignment=true&page=1&per_page=100&plain_messages=true")
      .then(status)
      .then(response => { return response.text(); })
      .then(parseJson)
      .then(function (c, data)
            {
      var div=document.getElementById('discussions_'+c.id);
      data.sort(byLastPostDate);
      div.innerHTML+=data.map(thread =>
                              {
        var title=c.shortName?thread.title:thread.title.split('- '+c.name)[0];
        return thread.discussion_subentry_count>0?
                              `<div class="threads"><a href="${thread.url}" title="${title}">${title}</a><span style="float:right;">(${thread.unread_count}/${thread.discussion_subentry_count})</span></div>`:''
      }).join('\n');
      var threads=div.getElementsByClassName('threads');
      for(var i=0; i<threads.length; i++)
      {
        var t=threads[i];
        t.childNodes[0].setAttribute('style', 'width:calc(100% - '+(t.childNodes[1].clientWidth+3)+'px); white-space:nowrap; overflow:hidden; display:inline-block; text-overflow:ellipsis;');
      }
      if(data.length==0)
      {
        div.parentNode.removeChild(div);
      }
    }.bind(undefined, c));
  }
}

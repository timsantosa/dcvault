var tag = document.createElement('script')
tag.src = 'https://www.youtube.com/iframe_api'
var firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

/* eslint-disable */

document.getElementById('bgVidPlayer').style.opacity = 0

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player
function onYouTubeIframeAPIReady () {
  player = new YT.Player('bgVidPlayer', {
    height: '1080',
    width: '1920',
    videoId: '6cGXtjKS_UQ',
    playerVars: {autoplay: 1, controls: 0, mute: 1},
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  })
}

var muteButton = document.getElementById('mute-button')
muteButton.onclick = function () {
  var isMuted = player.isMuted()
  if (isMuted) {
    player.unMute()
    muteButton.className = 'glyphicon glyphicon glyphicon-volume-up'
  } else {
    player.mute()
    muteButton.className = 'glyphicon glyphicon glyphicon-volume-off'
  }
}
// 4. The API will call this function when the video player is ready.
function onPlayerReady (event) {
  playerDiv = document.getElementById('bgVidPlayer')
  player.mute()
  event.target.playVideo()
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false
function onPlayerStateChange (event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    document.getElementById('bgVidPlayer').style.opacity = 1
    setTimeout(stopVideo, 90000)
    done = true
  }
}
function stopVideo () {
  document.getElementById('bgVidPlayer').style.opacity = 0
  setTimeout(player.stopVideo, 2000)
}

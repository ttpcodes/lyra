function SetVolume()
{
    // var vol = document.getElementById('video');
    // console.log('Before: ' + player.volume);
    // player.volume = val / 100;
    // console.log('After: ' + player.volume);
    player.setVolume($("#volume").val());
}

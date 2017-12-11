function next_generation() {
  //xD
}

$(document).ready(function() {
  $('#display-view').click(function() {
    console.log('xD');
    $('#splash-screen').css('display','none');
    $('#generation-view').css('display','block');
  });

  $('#next-generation').click(function() {
    next_generation();
  });

  
});
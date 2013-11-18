$('.category').click(function(e) {
  var card = $(this);
  console.log('card clicked');
  if(card.css('left') !== 'auto' && card.css('left') !== '0px') {
    uncollapseCards(this);
  }
  else {
    collapseCards(this);
  }
});

function uncollapseCards(category) {
  var card = $(category);
  card.css('left', '0');
  card.siblings().children('.notecard').css('left', '0').css('top', '0');
  var numCards = card.siblings().children('.notecard').length+1;
  var rows = Math.ceil(numCards/(~~($('body').width()/353)));
  var height = rows*200;
  card.parent().css('height', height+'px');
}
function collapseCards(category) {
  card = $(category);
  var center = $(window).width()/2 - card.width()/2 - card.position().left - 60;
  card.css('left', center+'px');
  card.siblings().children('.notecard').each(function(index, notecard) {
    notecard = $(notecard);
    center = $(window).width()/2 - notecard.width()/2 - notecard.position().left - 60;
    notecard.css('left', center+'px');
    notecard.css('top', -notecard.position().top+'px');
  });
  card.parent().css('height', '200px');
}

$('.category').each(function(index, card) {
  collapseCards(card);
});

$(window).on('resize', function(e) {
  $('.category').each(function(index, card) {
    uncollapseCards(card);
  });
});
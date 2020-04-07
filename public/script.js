const minusButton = document.getElementById('minus');
const plusButton = document.getElementById('plus');
const inputField = document.getElementById('input');

minusButton.addEventListener('click', event => {
  event.preventDefault();
  const currentValue = Number(inputField.value) || 0;
  inputField.value = currentValue - 1;
});

plusButton.addEventListener('click', event => {
  event.preventDefault();
  const currentValue = Number(inputField.value) || 0;
  inputField.value = currentValue + 1;
});

// ////////////////////
// // Number Stepper //
// ////////////////////
// console.log("script is showing");

// (function($) {
// $.fn.spinner = function() {
// this.each(function() {
// var el = $(this);

// // add elements
// el.wrap('<span class="spinner"></span>');     
// el.before('<span class="sub">-</span>');
// el.after('<span class="add">+</span>');

// // substract
// el.parent().on('click', '.sub', function () {
// if (el.val() > parseInt(el.attr('min')))
// el.val( function(i, oldval) { return --oldval; });
// });

// // increment
// el.parent().on('click', '.add', function () {
// if (el.val() < parseInt(el.attr('max')))
// el.val( function(i, oldval) { return ++oldval; });
// });
//     });
// };
// })(jQuery);

// $('input[type=number]').spinner();


///////////////
// Sky Icons //
//////////////
var icons = new Skycons({"color": "#FFD85C"});

icons.set("clear-day", Skycons.CLEAR_DAY);
icons.set("clear-night", Skycons.CLEAR_NIGHT);
icons.set("partly-cloudy-day", Skycons.PARTLY_CLOUDY_DAY);
icons.set("partly-cloudy-night", Skycons.PARTLY_CLOUDY_NIGHT);
icons.set("cloudy", Skycons.CLOUDY);
icons.set("rain", Skycons.RAIN);
icons.set("sleet", Skycons.SLEET);
icons.set("snow", Skycons.SNOW);
icons.set("wind", Skycons.WIND);
icons.set("fog", Skycons.FOG);

icons.play();
jQuery(document).ready(function($) {
	'use strict';

	$('.demo-filter a').on('click', function(e) {
		e.preventDefault();
		var filter = $(this).attr('href').replace('#', '');
		$('.demos').isotope({ filter: '.' + filter });
		$(this).addClass('active').siblings().removeClass('active');
	});

	$('.molla-lz').lazyload({
		effect: 'fadeIn',
		effect_speed: 400,
		appearEffect: '',
		appear: function(elements_left, settings) {
			
		},
		load: function(elements_left, settings) {
			$(this).removeClass('molla-lz').css('padding-top', '');
		}
	});

	// Mobile Menu Toggle - Show & Hide
	$('.mobile-menu-toggler').on('click', function (e) {
		$('body').toggleClass('mmenu-active');
		$(this).toggleClass('active');
		e.preventDefault();
	});

	$('.mobile-menu-overlay, .mobile-menu-close').on('click', function (e) {
		$('body').removeClass('mmenu-active');
		$('.menu-toggler').removeClass('active');
		e.preventDefault();
	});

	$('.goto-demos').on('click', function(e) {
		e.preventDefault();
		$('html, body').animate({scrollTop: $('.row.demos').offset().top}, 600);
	});

	$('.goto-features').on('click', function(e) {
		e.preventDefault();
		$('html, body').animate({scrollTop: $('.section-features').offset().top}, 800);
	});

	$('.goto-elements').on('click', function(e) {
		e.preventDefault();
		$('html, body').animate({scrollTop: $('.section-elements').offset().top}, 1000);
	});

	$('.goto-support').on('click', function(e) {
		e.preventDefault();
		$('html, body').animate({scrollTop: $('.section-support').offset().top}, 1200);
	});
});

jQuery(window).on('load', function() {
	jQuery('.demos').isotope({
		filter: '.homepages',
		initLayout: true,
		itemSelector: '.iso-item',
		layoutMode: 'masonry'
	}).on('layoutComplete', function(e) {
		jQuery(window).trigger('scroll');
	});
});



// otp page
document.addEventListener("DOMContentLoaded", function(event) {
  
	function OTPInput() {
  const inputs = document.querySelectorAll('#otp > *[id]');
  for (let i = 0; i < inputs.length; i++) { inputs[i].addEventListener('keydown', function(event) { if (event.key==="Backspace" ) { inputs[i].value='' ; if (i !==0) inputs[i - 1].focus(); } else { if (i===inputs.length - 1 && inputs[i].value !=='' ) { return true; } else if (event.keyCode> 47 && event.keyCode < 58) { inputs[i].value=event.key; if (i !==inputs.length - 1) inputs[i + 1].focus(); event.preventDefault(); } else if (event.keyCode> 64 && event.keyCode < 91) { inputs[i].value=String.fromCharCode(event.keyCode); if (i !==inputs.length - 1) inputs[i + 1].focus(); event.preventDefault(); } } }); } } OTPInput();
  
	  
  });



//   resend button


// After OTP is sent
// setTimeout(() => {
// 	document.querySelector('.resend-button').style.display = 'block';
//   }, 30000); // 30 seconds
  
$(function () {
	var menu = $('#slide_menu3'),
		menuBtn = $('#button3'),
		body = $(document.body),
		menuWidth = menu.outerWidth();

	menuBtn.on('click', function () {
		body.toggleClass('open');
		if (body.hasClass('open')) {
			menu.animate({ 'right': 8 }, 120);
		} else {
			menu.animate({ 'right': -260 }, 120);
		}
	});
});    
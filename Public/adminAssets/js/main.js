!function(e){"use strict";if(e(".menu-item.has-submenu .menu-link").on("click",function(s){s.preventDefault(),e(this).next(".submenu").is(":hidden")&&e(this).parent(".has-submenu").siblings().find(".submenu").slideUp(200),e(this).next(".submenu").slideToggle(200)}),e("[data-trigger]").on("click",function(s){s.preventDefault(),s.stopPropagation();var n=e(this).attr("data-trigger");e(n).toggleClass("show"),e("body").toggleClass("offcanvas-active"),e(".screen-overlay").toggleClass("show")}),e(".screen-overlay, .btn-close").click(function(s){e(".screen-overlay").removeClass("show"),e(".mobile-offcanvas, .show").removeClass("show"),e("body").removeClass("offcanvas-active")}),e(".btn-aside-minimize").on("click",function(){window.innerWidth<768?(e("body").removeClass("aside-mini"),e(".screen-overlay").removeClass("show"),e(".navbar-aside").removeClass("show"),e("body").removeClass("offcanvas-active")):e("body").toggleClass("aside-mini")}),e(".select-nice").length&&e(".select-nice").select2(),e("#offcanvas_aside").length){const e=document.querySelector("#offcanvas_aside");new PerfectScrollbar(e)}e(".darkmode").on("click",function(){e("body").toggleClass("dark")})}(jQuery);
// Get the current URL
const currentURL = window.location.href;

    // Select all menu links
    const menuLinks = document.querySelectorAll('.menu-link');

    // Loop through the menu links
    menuLinks.forEach((link) => {
        const menuItem = link.parentElement;

        // Check if the link's href matches the current URL
        if (currentURL.includes(link.getAttribute('href'))) {
            // Add the "active" class to the parent menu item
            menuItem.classList.add('active');

            // If it's a sub-menu item, also highlight the parent menu item
            if (menuItem.classList.contains('submenu')) {
                menuItem.closest('.menu-item').classList.add('active');
            }
        }
    });

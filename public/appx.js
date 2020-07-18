// $(document).ready(function () {
//   $("nav ul li a").click(function () {
//     $("nav ul li a").removeClass("active");
//     $(this).addClass("active");
//   });
// });
$(document).ready(function () {
  var cl = window.location;
  if (cl == "http://localhost:3000/dashboard") {
    $("#home").addClass("active");
  }
  if (cl == "http://localhost:3000/admin") {
    $("#admin").addClass("active");
  }
});

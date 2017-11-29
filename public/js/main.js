var socket = io();

// login failed
socket.on("login_fail", function(data) {
$("#status").text('Wrong Username or Password. Retry.');
});
// login succeeded. Set cookies if needed
socket.on("login_success", function (data) {
Cookies.set('auth', data, { expires: 3 });
$("#status").text('');
$("#form_login").hide(2000);
$("#form_signup").hide(2000);
$("#form_submit").show(1000);
$("#nowuser").text('Welcome ' + $("#username").val());
$("#idnowuser").val('Now User: '+$("#username").val());
});
socket.on('already_authenticated', function(data) {
$("#status").text('');
$("#form_login").hide(0);
$("#form_signup").hide(0);
$("#form_submit").show(0);
$("#nowuser").text('Welcome ' + data.username);
});
socket.on("Exist this account", function(data) {
alert('This account is existence !');
});
socket.on("signup_successfully", function(data) {
alert('Sign up successfully !');
$("#form_signup").hide(2000);
$("#form_submit").show(1000);
});
socket.on("your_result",function(data){
if(data[2]==null) data[2]='None';
$("#pa_result1").text(data[0]);
$("#pa_result2").text(data[1]);
$("#Fault").text('Fault: '+data[2]);
$("#Point").text('Point: '+data[3]);
});
$(document).ready(function() {
// by default, load form_login first
// other forms hide
if ($("#username").val() == '') {
    $("#form_submit").hide();
    if (0) {
        $("#form_signup").hide();
        $("#btn_view_result").hide();
    } else {
        //  $("#form_submit").show();
        $("#form_login").show();
        $("#form_signup").hide();
        $("#btn_view_result").hide();
        $("#form_submit").hide();
    }
}

$("#btnlogin").click(function() {
    let data = {
        username: $("#username").val(),
        password: $("#password").val(),
    }
    socket.emit("login", data);
});
// sign up buton, create new account
// hide other form except form_signup
$("#signup-link").click(function() {
    console.log('strange');
    $("#form_submit").hide();
    $("#form_login").hide();
    $("#form_signup").show();
    $("#btn_view_result").hide();
});
// back to log in buton
$("#login-link").click(function() {
    $("#form_submit").hide();
    $("#form_login").show();
    $("#form_signup").hide();
    $("#btn_view_result").hide();
});
// button sign up and log in
// check confirm password
// write new data
// check data to log in
$("#btnSL").click(function() {
    if ($('#Spassword').val() != $("#Scpassword").val())
        alert('Wrong Confirm Password !');
    else {
        let data = new Array($("#Susername").val(), $('#Suseremail').val(), $('#Spassword').val(), $("#Scpassword").val());
        socket.emit("signup", data);
    }
});
// compiler testing, show result
$("#btn_view_result").click(function() {
    socket.emit("wait_for_point", $("#username").val());
});
$("#send_file").click(function() {
    $("#btn_view_result").show(5000);
});
});

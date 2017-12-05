var socket = io('http://localhost:3000');
var uploader = new SocketIOFileClient(socket);
var form = document.getElementById('form');
form.onsubmit = function(ev) {
	if(Number($("#selectedTopic").val())>0){
	ev.preventDefault();

	// Send File Element to upload
	var fileEl = document.getElementById('file');
	// var uploadIds = uploader.upload(fileEl);

	// Or just pass file objects directly

	var uploadIds = uploader.upload(fileEl.files);
 }
 else alert('Please Choose Your Topic !');
};
function getHistoryTable(historyTable){
  $("#historyTable  tbody > tr").remove();
  $("#historyTable").append('<tbody>');
  for(let i=1;i<historyTable.length;++i){
    let line=''
    for(let j=0;j<historyTable[i].length;++j){
     line+='<td>'+historyTable[i][j]+'</td>';
    }
    $("#historyTable").append('<tr>'+line+'</tr>');
  }
    $("#historyTable").append('</tbody>');
}
function getRankTable(rankTable){
  $("#rankTable  tbody > tr").remove();
  $("#rankTable").append('<tbody>');
  for(let i=1;i<rankTable.length;++i){
    let line=''
    for(let j=0;j<rankTable[i].length;++j){
     line+='<td>'+rankTable[i][j]+'</td>';
    }
    $("#rankTable").append('<tr>'+line+'</tr>');
  }
    $("#rankTable").append('</tbody>');
    let rank=0;
    for(let i=1;i<rankTable.length;++i){
      if(rankTable[i][0]==$("#username").val()){
        rank=i;
      }
    }
    $("#yourRank").text('Your Rank: '+rank);
}
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
if(data[1]==null) data[1]='None';
$("#pa_result").text(data[0]);
$("#Error").text('Error: '+data[1]);
$("#Point").text('Point: '+data[2]);
});
socket.on("Your_Topic",function(contentTopic){
  $("#contentTopic").text(contentTopic);
});
socket.on("Your_history_table",function(historyTable){
  getHistoryTable(historyTable);
});
socket.on("Now_User",function(line){
  $("#nowaccname").text('Account: '+line[0]);
  $("#nowusername").text('User Name: '+line[1]);
  $("#nowemail").text('Email Contact: '+line[2]);
});
socket.on("Your_Rank",function(numtopic,typerank,typesort,rankTable){
  if(numtopic==$("#selectedTopic").val()){
   if(typerank==$("#selectedTypeRank").val()){
     if(typesort==$('input[name=gender]:checked','#typeSort').val()){
       getRankTable(rankTable);
     }
   }
  }
});
socket.on("Error_Upload",function(err){
	 $("#statusSendFile").text('Fail in uploading this file !');
});
socket.on("Success_Upload",function(success){
	 $("#statusSendFile").text('Uploading file successfully !');
});
socket.on("forum_chat",function(id,message){
	 $("#forumChat").append('<div>'+id+': '+message+'</div>');
});
socket.on("List_Online",function(users){
		for(let i=0;i<users.length;++i){
			 $("#listOnlines").append('<div>'+users[i]+'</div>');
		}
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
				$("#compilebtn").hide();
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
    let data=new Array($("#username").val(),$("#selectedTopic").val());
    socket.emit("wait_for_point",data);
    $("#btn_view_result").hide(1000);
});
$("#send_file").click(function() {
    if(Number($("#selectedTopic").val())>0)
    {$("#compilebtn").show(1000);}
});

$("#selectedTopic").on('change',function(){
    if(Number($("#selectedTopic").val())>0)
    {
      socket.emit("Choose_Topic",$("#selectedTopic").val());
      $("#nowtopic").val($("#selectedTopic").val());
    }
    else {$("#contentTopic").text('');}
    $("#historyTable  tbody > tr").remove();
    $("#rankTable  tbody > tr").remove();
});
$("#typeSort input").on('change',function(){
    //alert($('input[name=gender]:checked','#typeSort').val());
      $("#rankTable  tbody > tr").remove();
});
$("#tabHistory").click(function(){
  let data=new Array($("#username").val(),$("#selectedTopic").val());
  socket.emit("get_history_table",data);
	socket.emit("send_file",$("#username").val(),$("#nowtopic").val());
});
$("#tabRank").click(function(){
  let numtopic=$("#selectedTopic").val();
  let typerank=$("#selectedTypeRank").val();
  let typesort=$('input[name=gender]:checked','#typeSort').val();
  socket.emit("get_Rank",numtopic,typerank,typesort);
	socket.emit("test",'ahihi');
});
$("#selectedTypeRank").on('change',function(){
   $("#rankTable  tbody > tr").remove();
});
$("#compilebtn").click(function(){
	socket.emit("compile",$("#username").val());
	$("#compilebtn").hide(1000);
	$("#btn_view_result").show(5000);
});
$("#sendMessagebtn").click(function(){
		if($("#inputMessage").val()!=''){
			 socket.emit("chat",$("#username").val(),$("#inputMessage").val());
		}
		else alert('Please type your message !')
});
$("#chatField").click(function(){
		socket.emit("online",$("#username").val());
});
});

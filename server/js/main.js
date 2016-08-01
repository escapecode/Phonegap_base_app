function send_message()
{
	$.ajax({
			type: "GET",
			url: "notifications_send.php",
			dataType: "text",
			data: $('#frm_notify').serialize()
		}).done(function(data) {
			$("#status").append('<br />' + data);
		}).fail(function(jqXHR, textStatus, msg){
			$("#status").append('<br />qXHR=' + jqXHR + '<br />status=' + textStatus + '<br />msg=' + msg + "<hr />");
	});
}
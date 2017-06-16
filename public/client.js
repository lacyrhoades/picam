$(function() {
  console.log('hello world π');
  
  var socket = io('/web');
  
  socket.on('showControls', function () {
    $('div.controls').show();
    $('div.controlInfo').hide();
  });
  
  socket.on('hideControls', function (data) {
    $('div.controls').hide();
    $('div.controlInfo').show();
  });
  
  socket.on('showUptime', function (uptime) {
    $('p.uptime').show();
    $('p.uptime').html(uptime);
  });
  
  socket.on('hideUptime', function (uptime) {
    $('p.uptime').hide();
  });
  
  socket.on('showLoading', function (data) {
    $('.loading').show();
  });
  
  socket.on('image', function (data) {
    $('.loading').hide();
    $('img.preview').attr('src', data);
    refreshTimestamp();
  });
  
  socket.on('settings', function(camera) {
    $('.exposureVal').html(camera.exposureString);
    $('input[name="vflip"]').prop('checked', camera.vflip);
    $('input[name="hflip"]').prop('checked', camera.hflip);
    $('input[name=effect][value="' + camera.effect + '"]').prop("checked", true);
    $('input[name=mode][value="' + camera.mode + '"]').prop("checked", true);
    $('input[name=awbMode][value="' + camera.awbMode + '"]').prop("checked", true);
    $('button').attr('disabled', false);
    $('input').attr('disabled', false);
  });

  $('button.exposureUp').click(function () {
    socket.emit('exposure', 1);
  });
  
  $('button.exposureDown').click(function () {
    socket.emit('exposure', -1);
  });
  
  $('input[name="vflip"]').on('change', function () {
    socket.emit('vflip');
  });
  
  $('input[name="hflip"]').on('change', function () {
    socket.emit('hflip');
  });
  
  $('input[name="effect"]').on('change', function () {
    socket.emit('effect', $(this).val());
  });
  
  $('input[name="awbMode"]').on('change', function () {
    socket.emit('awbMode', $(this).val());
  });
  
  $('input[name="mode"]').on('change', function () {
    socket.emit('mode', $(this).val());
  });
  
  $('button.snap').click(function () {
    socket.emit('snap');
  })
  
  setInterval(function () {
    refreshTimestamp();
  }, 10000);
  
  refreshTimestamp();
});

function refreshTimestamp() {
  $.get("/timestamp", function (data) {
    $(".timestamp").html(data.timestamp);
  }, "json")
}
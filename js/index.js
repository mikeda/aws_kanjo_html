$(function(){
  var regions = [
    "us-east-1",
    "us-west-2",
    "us-west-1",
    "eu-west-1",
    "eu-central-1",
    "ap-southeast-1",
    "ap-northeast-1",
    "ap-southeast-2",
    "sa-east-1"
  ];
  var default_region = "ap-northeast-1";
  var ec2_price = null;
  var yen_rate = null;

  function update_ec2_price(ec2_price, region, yen_rate){
    $("#ec2-price-list").empty();

    $.each(ec2_price[region], function(i, instanceType){
      var table = $('<table class="table table-striped table-condensed">');
      table.append('<caption class="text-left">' + instanceType.type + '</caption>');
      var th = $('<tr>')
        .append('<th>サイズ</th>')
        .append('<th class="text-right">CPU</th>')
        .append('<th class="text-right">ECU</th>')
        .append('<th class="text-right">メモリ</th>')
        .append('<th class="text-right">ストレージ</th>')
        .append('<th class="text-right">料金 /時間</th>')
        .append('<th class="text-right">料金 /月</th>');
      table.append($('<thead>').append(th));
      var tbody = $('<tbody>');
      $.each(instanceType.sizes, function(i, size){
        var usd = parseFloat(size.valueColumns[0].prices.USD);
        var yen = (usd * yen_rate).toFixed(2);
        var yen_per_month = Math.ceil(usd * yen_rate * 24 * 30)
        var td = $('<tr>')
          .append('<th ">' + size.size + '</th>')
          .append('<td align="right">' + size.vCPU + '</td>')
          .append('<td align="right">' + size.ECU + '</td>')
          .append('<td align="right">' + size.memoryGiB + '</td>')
          .append('<td align="right">' + size.storageGB + '</td>')
          .append('<td align="right">¥' + yen.toLocaleString() + '</td>')
          .append('<td align="right">¥' + yen_per_month.toLocaleString() + '</td>');

        tbody.append(td);
      });
      table.append(tbody);
      $("#ec2-price-list").append(table);
    });
  }

  function update_ec2_price_csv(ec2_price, region, yen_rate){
    $("#ec2-price-csv").empty();

    var lines = [
      "サイズ,ECU,CPUコア数,メモリ,ストレージ,料金/時間,料金/月"
    ];
    $.each(ec2_price[region], function(i, instanceType){
      $.each(instanceType.sizes, function(i, size){
        var usd = parseFloat(size.valueColumns[0].prices.USD);
        var yen = (usd * yen_rate).toFixed(2);
        var yen_per_month = Math.ceil(usd * yen_rate * 24 * 30)
        lines.push( [
          size.size,
          size.vCPU,
          size.ECU,
          size.memoryGiB,
          size.storageGB,
          yen,
          yen_per_month
        ].join(","));
      });
    });
    $("#ec2-price-csv").text(lines.join("\n"));
  }

  $("#calculate-price").click(function(){
    var usd = parseFloat($("#price-usd").val());
    var yen_per_month = Math.ceil(usd * yen_rate * 24 * 30);
    $("#price-yen").val(yen_per_month);
  });

  $.each(regions, function(){
    $("#region-list").append('<li><a href="#">' + this + '</a></li>');
  });
  $("#region-btn").html(default_region + ' <span class="caret"></span>');
  $("#region-list li").on("click", function(){
    var region = $(this).text();
    $("#region-btn").html(region + ' <span class="caret"></span>');
    update_ec2_price(ec2_price, region, yen_rate);
    update_ec2_price_csv(ec2_price, region, yen_rate);
  });

  get_yen_rate(function(_yen_rate){
    yen_rate = _yen_rate;
    $(".yen-rate").text(yen_rate);

    get_ec2_price(function(_ec2_price){
      ec2_price = _ec2_price;
      update_ec2_price(ec2_price, default_region, yen_rate);
      update_ec2_price_csv(ec2_price, default_region, yen_rate);
    });

  });
});

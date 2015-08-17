$(function(){
  var regions = [
    "us-east-1",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-central-1",
    "ap-northeast-1",
    "ap-southeast-1",
    "ap-southeast-2",
    "sa-east-1"
  ];

  var region = "ap-northeast-1";
  var yen_rate = null;
  var ec2_price = null;
  var ec2_ri_price = null;
  var ec2_ri_min_price = null;
  var rds_price = null;

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
        .append('<th class="text-right">月額</th>')
        .append('<th class="text-right">月額(1年RI)</th>')
        .append('<th class="text-right">月額(3年RI)</th>');
      table.append($('<thead>').append(th));
      var tbody = $('<tbody>');
      $.each(instanceType.sizes, function(i, size){
        var usd = parseFloat(size.valueColumns[0].prices.USD);
        var yen = (usd * yen_rate).toFixed(2);
        var yen_per_month = Math.ceil(usd * yen_rate * 24 * 365 / 12);
        if(ec2_ri_min_price && ec2_ri_min_price[region][size.size]){
          var yen_per_month_ri1 = Math.ceil(ec2_ri_min_price[region][size.size]["yrTerm1"] * yen_rate * 24 * 365 / 12);
          var yen_per_month_ri3 = Math.ceil(ec2_ri_min_price[region][size.size]["yrTerm3"] * yen_rate * 24 * 365 / 12);
        }
        var td = $('<tr>')
          .append('<th ">' + size.size + '</th>')
          .append('<td align="right">' + size.vCPU + '</td>')
          .append('<td align="right">' + size.ECU + '</td>')
          .append('<td align="right">' + size.memoryGiB + '</td>')
          .append('<td align="right">' + size.storageGB + '</td>')
          .append('<td align="right">¥' + yen.toLocaleString() + '</td>')
          .append('<td align="right">¥' + yen_per_month.toLocaleString() + '</td>')
          .append('<td align="right">' + (yen_per_month_ri1 ? "¥" + yen_per_month_ri1.toLocaleString() : "") + '</td>')
          .append('<td align="right">' + (yen_per_month_ri3 ? "¥" + yen_per_month_ri3.toLocaleString() : "") + '</td>');

        tbody.append(td);
      });
      table.append(tbody);
      $("#ec2-price-list").append(table);
    });
  }

  function update_ec2_ri_price(ec2_ri_price, region, yen_rate){
    $("#ec2-ri-price-list").empty();

    $.each(ec2_ri_price[region], function(i, instanceType){
      var table = $('<table class="table table-striped table-condensed">');
      table.append('<caption class="text-left">' + instanceType.type + '</caption>');
      var th = $('<tr>')
        .append('<th>予約期間</th>')
        .append('<th>支払いオプション</th>')
        .append('<th class="text-right">初期費用</th>')
        .append('<th class="text-right">月額</th>')
        .append('<th class="text-right">実質月額</th>')
        .append('<th class="text-right">ODからの値引率</th>');
      table.append($('<thead>').append(th));
      var tbody = $('<tbody>');

      $.each(instanceType.terms, function(i, term){
        $.each(term.purchaseOptions, function(index, purchaseOption){
          var usd = []
          $.each(purchaseOption.valueColumns, function(){
            usd.push(parseFloat(this.prices.USD) * yen_rate);
          });
          var upfront = Math.ceil(usd[0]).toLocaleString();
          var monthlyStar = Math.ceil(usd[1]).toLocaleString();
          var effectiveMonthly = Math.ceil(usd[2] * 24 * 365 / 12).toLocaleString();
          var td = $('<tr>');
          if(index == 0){
            var rowspan = term.term == 'yrTerm1' ? 3 : 2;
            var term_text = term.term == 'yrTerm1' ? '1年' : '3年';
            td.append('<td rowspan="' + rowspan + '">' + term_text + '</td>');
          }
          td
            .append('<td>' + purchaseOption.purchaseOption + '</td>')
            .append('<td align="right">¥' + upfront + '</td>')
            .append('<td align="right">¥' + monthlyStar + '</td>')
            .append('<td align="right">¥' + effectiveMonthly + '</td>')
            .append('<td align="right">¥' + purchaseOption.savingsOverOD + '</td>');
          tbody.append(td);
        });

      });
      table.append(tbody);
      $("#ec2-ri-price-list").append(table);
    });
  }

  function update_ec2_price_csv(ec2_price, region, yen_rate){
    $("#ec2-price-csv").empty();

    var lines = [
      "サイズ,CPUコア数,ECU,メモリ,ストレージ,料金/時間,月額,月額(1年RI),月額(3年RI)"
    ];
    $.each(ec2_price[region], function(i, instanceType){
      $.each(instanceType.sizes, function(i, size){
        var usd = parseFloat(size.valueColumns[0].prices.USD);
        var yen = (usd * yen_rate).toFixed(2);
        var yen_per_month = Math.ceil(usd * yen_rate * 24 * 365 / 12)
        if(ec2_ri_min_price[region][size.size]){
          var yen_per_month_ri1 = Math.ceil(ec2_ri_min_price[region][size.size]["yrTerm1"] * yen_rate * 24 * 365 / 12);
          var yen_per_month_ri3 = Math.ceil(ec2_ri_min_price[region][size.size]["yrTerm3"] * yen_rate * 24 * 365 / 12);
        }
        lines.push( [
          size.size,
          size.vCPU,
          size.ECU,
          size.memoryGiB,
          size.storageGB,
          yen,
          yen_per_month,
          yen_per_month_ri1 || "",
          yen_per_month_ri3 || ""
        ].join(","));
      });
    });
    $("#ec2-price-csv").text(lines.join("\n"));
  }

  function update_rds_price(rds_price, region, yen_rate){
    $("#rds-price-list").empty();

    $.each(rds_price[region], function(i, type){
      var table = $('<table class="table table-striped table-condensed">');
      table.append('<caption class="text-left">' + type.name + '</caption>');
      var th = $('<tr>')
        .append('<th>サイズ</th>')
        .append('<th class="text-right">料金 /時間</th>')
        .append('<th class="text-right">月額</th>');
      table.append($('<thead>').append(th));
      var tbody = $('<tbody>');
      $.each(type.tiers, function(i, tier){
        var usd = parseFloat(tier.prices.USD);
        var yen = (usd * yen_rate).toFixed(2);
        var yen_per_month = Math.ceil(usd * yen_rate * 24 * 365 / 12 );
        var td = $('<tr>')
          .append('<th ">' + tier.name + '</th>')
          .append('<td align="right">¥' + yen.toLocaleString() + '</td>')
          .append('<td align="right">¥' + yen_per_month.toLocaleString() + '</td>');

        tbody.append(td);
      });
      table.append(tbody);
      $("#rds-price-list").append(table);
    });
  }

  function set_ec2_ri_min_price(){
    ec2_ri_min_price = {};
    $.each(ec2_ri_price, function(region, instanceTypes){
      ec2_ri_min_price[region] = {};
      $.each(instanceTypes, function(i, instanceType){
        ec2_ri_min_price[region][instanceType.type] = {
          yrTerm1: parseFloat(instanceType.terms[0].purchaseOptions[2].valueColumns[2].prices.USD),
          yrTerm3: parseFloat(instanceType.terms[1].purchaseOptions[1].valueColumns[2].prices.USD)
        };
      });
    });
  }

  $("#calculate-price").click(function(){
    var usd = parseFloat($("#price-usd").val());
    var yen_per_month = Math.ceil(usd * yen_rate * 24 * 365 / 12);
    $("#price-yen").val(yen_per_month);
  });

  $.each(regions, function(){
    $("#region-list").append('<li><a href="#">' + this + '</a></li>');
  });
  $("#region-btn").html(region + ' <span class="caret"></span>');
  $("#region-list li").on("click", function(){
    region = $(this).text();
    $("#region-btn").html(region + ' <span class="caret"></span>');
    update_ec2_price(ec2_price, region, yen_rate);
    update_ec2_price_csv(ec2_price, region, yen_rate);
    update_rds_price(rds_price, region, yen_rate);
  });

  get_yen_rate(function(_yen_rate){
    yen_rate = _yen_rate;
    $(".yen-rate").text(yen_rate);

    get_ec2_price(function(_ec2_price){
      ec2_price = _ec2_price;
      update_ec2_price(ec2_price, region, yen_rate);

      get_ec2_ri_price(function(_ec2_ri_price){
        ec2_ri_price = _ec2_ri_price;
        set_ec2_ri_min_price();
        update_ec2_price(ec2_price, region, yen_rate);
        update_ec2_ri_price(ec2_ri_price, region, yen_rate);
        update_ec2_price_csv(ec2_price, region, yen_rate);
      });
    });
  });

  $("#rds-button").click(function(){
    $("#ec2-content").hide();
    if(rds_price){
      update_rds_price(rds_price, region, yen_rate);
      $("#rds-content").show();
    }else{
      get_rds_price(function(_rds_price){
        rds_price = _rds_price;
        update_rds_price(rds_price, region, yen_rate);
        $("#rds-content").show();
      });
    }
  });

  $("#ec2-button").click(function(){
    $("#rds-content").hide();
    $("#ec2-content").show();
  });
});

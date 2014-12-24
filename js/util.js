function _jsonp_get(url, success){
  $.ajax({
    type: "GET",
    url: url,
    dataType: "jsonp",
    jsonpCallback: 'callback',
    success: success
  });
}

function get_yen_rate(callback){
  var url = "https://rate-exchange.appspot.com/currency?from=usd&to=jpy";
  _jsonp_get(url, function(data){
    callback(data.rate);
  });
}

function get_ec2_price(success){
  var current_url = "https://a0.awsstatic.com/pricing/1/ec2/linux-od.min.js";
  var previous_url = "https://a0.awsstatic.com/pricing/1/ec2/previous-generation/linux-od.min.js";
  var ec2_price = {};

  _jsonp_get(current_url, function(current_data){
    $.each(current_data.config.regions, function(){
      ec2_price[this.region] = this.instanceTypes;
    });

    _jsonp_get(previous_url, function(previous_data){
      $.each(previous_data.config.regions, function(){
        ec2_price[this.region] = ec2_price[this.region].concat(this.instanceTypes);
      });

      success(ec2_price);
    });
  });
}

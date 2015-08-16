var rds_regions = {
  "us-east": "us-east-1",
  "us-west": "us-west-1",
  "us-west-2": "us-west-2",
  "eu-ireland": "eu-west-1",
  "eu-central-1": "eu-central-1",
  "apac-tokyo": "ap-northeast-1",
  "apac-sin": "ap-southeast-1",
  "apac-syd": "ap-southeast-2",
  "sa-east-1": "sa-east-1"
};

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
  var url = "https://api.fixer.io/latest?base=USD&symbols=JPY&callback=callback";
  _jsonp_get(url, function(data){
    callback(data.rates.JPY);
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

function get_ec2_ri_price(success){
  var current_url = "https://a0.awsstatic.com/pricing/1/ec2/ri-v2/linux-unix-shared.min.js";
  var previous_url = "https://a0.awsstatic.com/pricing/1/ec2/previous-generation/ri-v2/linux-unix-shared.min.js";
  var ec2_ri_price = {};

  _jsonp_get(current_url, function(current_data){
    $.each(current_data.config.regions, function(){
      ec2_ri_price[this.region] = this.instanceTypes;
    });
    _jsonp_get(previous_url, function(previous_data){
      $.each(previous_data.config.regions, function(){
        ec2_ri_price[this.region] = ec2_ri_price[this.region].concat(this.instanceTypes);
      });

      success(ec2_ri_price);
    });
  });
}

function get_rds_price(success){
  var current_url = "https://a0.awsstatic.com/pricing/1/rds/mysql/pricing-standard-deployments.min.js";
  var previous_url = "https://a0.awsstatic.com/pricing/1/rds/mysql/previous-generation/pricing-standard-deployments.min.js";
  var rds_price = {};

  _jsonp_get(current_url, function(current_data){
    $.each(current_data.config.regions, function(){
      rds_price[rds_regions[this.region]] = this.types;
    });

    _jsonp_get(previous_url, function(previous_data){
      $.each(previous_data.config.regions, function(){
        rds_price[rds_regions[this.region]] = rds_price[rds_regions[this.region]].concat(this.types);
      });

      success(rds_price);
    });
  });
}

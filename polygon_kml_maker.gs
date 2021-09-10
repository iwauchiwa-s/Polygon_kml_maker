// Polygon KML maker
// GAS polygon_kml_maker.gs
// version 1.0

function poly_preview(){
  var sheet = SpreadsheetApp.getActive().getSheetByName('Polygon');
  var sheet_kml = SpreadsheetApp.getActive().getSheetByName('kml');

  var kml_fn = sheet.getRange('G2').getValue();
  var contentType = "text/xml";
  var charSet = "utf-8";

  var hgtBias = Number(sheet.getRange('G6').getValue());
  var hgtFact = Number(sheet.getRange('H6').getValue());
  var polyWdt = Number(sheet.getRange('I6').getValue());
  var posShft = Number(sheet.getRange('J6').getValue());


  var rgb_min = sheet.getRange('G10').getBackground();
  var rgb_max = sheet.getRange('H10').getBackground();
  var trp = Number(sheet.getRange('I10').getValue());

  //console.log(rgb_max);

  var poly_fac = polyWdt / 2.0 / 111000.0;
  var poly_pos = posShft / 111000.0;

  var rd1 = parseInt(rgb_min.slice(1, 3), 16);
  var gd1 = parseInt(rgb_min.slice(3, 5), 16);
  var bd1 = parseInt(rgb_min.slice(5, 7), 16);
  var rd2 = parseInt(rgb_max.slice(1, 3), 16);
  var gd2 = parseInt(rgb_max.slice(3, 5), 16);
  var bd2 = parseInt(rgb_max.slice(5, 7), 16);

  var trpHex = dec_to_hex( Math.floor((trp-100)/100*255) );

  var data_num = sheet.getRange(1, 3).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() -1;
  var lon_ar = sheet.getRange(2, 2, data_num).getValues();
  var lat_ar = sheet.getRange(2, 1, data_num).getValues();
  var val_ar = sheet.getRange(2, 3, data_num).getValues();

  var lon = Array.prototype.concat.apply([],lon_ar);
  var lat = Array.prototype.concat.apply([],lat_ar);
  var val = Array.prototype.concat.apply([],val_ar);

  var lon = lon.filter(checkEmpty);
  var lat = lat.filter(checkEmpty);
  var val = val.filter(checkEmpty);

    //console.log(lon.length);

  if(val.length == 0){
    Browser.msgBox('データがありません。\\n実行をキャンセルしました。');
    return ;
  }

  var val_min = get_min(val);
  var val_max = get_max(val);

  var lon_av = get_average(lon);
  var lat_av = get_average(lat);
  var lon_min = get_min(lon);
  var lon_max = get_max(lon);
  var lat_min = get_min(lat);
  var lat_max = get_max(lat);
  var lon_range = 3.0 * ( lon_max - lon_min ) * 111000.0 * Math.cos( Math.abs(lat_av) * Math.PI / 180.0 );
  var lat_range = 3.0 * ( lat_max - lat_min ) * 111000.0;
  var v_range = 100.0;
  if(lon_range > lat_range){
    v_range = lon_range;
  }else{
    v_range = lat_range;
  }

  var head_kml = 
`<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://earth.google.com/kml/2.1">
<Document>
<name>Plot</name>
<open>1</open>
<LookAt>
<longitude>` + lon_av.toString() + `</longitude>
<latitude>` + lat_av.toString() + `</latitude>
<altitude>0</altitude>
<heading>0</heading>
<tilt>0</tilt>
<range>` + v_range.toString() + `</range>
<gx:altitudeMode>relativeToSeaFloor</gx:altitudeMode>
</LookAt>
<Folder>
<name>Graph</name>
`;

  var data_kml = 
`</Folder>
<Folder>
<name>Values</name>
`;

  var foot_kml = 
`</Folder>
</Document>
</kml>
`;

  var poly_kml;
  var poly_each;
  for(var i=0; i<val.length; i++){
    var loni = Number(lon[i]);
    var lati = Number(lat[i]);
    var vali = Number(val[i]);
    
    poly_each = '';

    if(val_max == val_min){
      var rd = rd2;var gd = gd2; var bd = bd2;
    }else{
      var rd = Math.floor( rd1+(vali-val_min)/(val_max-val_min)*(rd2-rd1) );
      var gd = Math.floor( gd1+(vali-val_min)/(val_max-val_min)*(gd2-gd1) );
      var bd = Math.floor( bd1+(vali-val_min)/(val_max-val_min)*(bd2-bd1) );
    }


    var rr = dec_to_hex(rd);
    var gg = dec_to_hex(gd);
    var bb = dec_to_hex(bd);

    if(Math.abs(lati) > 89.0){
      var lon1 = loni - poly_fac;
      var lon2 = loni + poly_fac;
    }else{
      var lon1 = loni - poly_fac / Math.cos( Math.abs(lati) * Math.PI / 180.0 );
      var lon2 = loni + poly_fac / Math.cos( Math.abs(lati) * Math.PI / 180.0 );
    }


    var lat1 = lati - poly_fac + poly_pos;
    var lat2 = lati + poly_fac + poly_pos;
    var val0 = ( vali - hgtBias ) * hgtFact;

    sheet.getRange('D'+(i+2)).setValue(val0);
    sheet.getRange('D'+(i+2)).setBackgroundRGB(rd,gd,bd);

    var poly_each = `<Placemark>
<Style>
<LineStyle>
<color>00ffffff</color>
</LineStyle>
<PolyStyle>
<color>` + trpHex + bb + gg + rr + `</color>
<outline>1</outline>
</PolyStyle>
</Style>
<Polygon>
<extrude>1</extrude>
<altitudeMode>relativeToGround</altitudeMode>
<outerBoundaryIs>
<LinearRing>
<coordinates>
` + lon1.toString() + `,` + lat1.toString() + `,` + val0.toString() +`
` + lon1.toString() + `,` + lat2.toString() + `,` + val0.toString() +`
` + lon2.toString() + `,` + lat2.toString() + `,` + val0.toString() +`
` + lon2.toString() + `,` + lat1.toString() + `,` + val0.toString() +`
` + lon1.toString() + `,` + lat1.toString() + `,` + val0.toString() +`
</coordinates>
</LinearRing>
</outerBoundaryIs>
</Polygon>
</Placemark>`;

    var poly_kml = poly_kml + poly_each;

  }

  var value_kml = '';
  var value_each_kml = '';
  for(var i=0; i<val.length; i++){
    var loni = Number(lon[i]);
    var lati = Number(lat[i]);
    var vali = Number(val[i]);

    var lon1 = loni;
    var lat1 = lati + poly_pos;
    var val_num = vali;
    var val0 = ( vali-hgtBias ) * hgtFact * 1.1;

    var value_each_kml = `<Placemark>
<name>` + val_num.toString() + `</name>
<Style>
<IconStyle>
<Icon>
</Icon>
</IconStyle>
<LabelStyle>
<color>ff00ffff</color>
<scale>0.7</scale>
</LabelStyle>
</Style>
<Point>
<altitudeMode>relativeToGround</altitudeMode>
<coordinates>` + lon1.toString() + `,` + lat1.toString() + `,` + val0.toString() + `</coordinates>
</Point>
</Placemark>
`;

    var value_kml = value_kml + value_each_kml;

  }

  var kml_all = head_kml + poly_kml + data_kml + value_kml + foot_kml;

  if(kml_all.length > 50000){
    sheet_kml.getRange('A1').setValue(kml_all.slice(0,49999));
    Browser.msgBox('データ数が多いため\\nテキストが50000字を超えました\\nこのツールでは一部のKMLテキストのみ表示できます\\nテキスト全体はドライブに保存して確認してください');
  }else{
    sheet_kml.getRange('A1').setValue(kml_all);
  }

}


function polygon_kml_maker() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Polygon');
  var sheet_kml = SpreadsheetApp.getActive().getSheetByName('kml');

  var kml_fn = sheet.getRange('G2').getValue();
  var contentType = "text/xml";
  var charSet = "utf-8";

  var hgtBias = Number(sheet.getRange('G6').getValue());
  var hgtFact = Number(sheet.getRange('H6').getValue());
  var polyWdt = Number(sheet.getRange('I6').getValue());
  var posShft = Number(sheet.getRange('J6').getValue());


  var rgb_min = sheet.getRange('G10').getBackground();
  var rgb_max = sheet.getRange('H10').getBackground();
  var trp = Number(sheet.getRange('I10').getValue());

  //console.log(rgb_max);

  var poly_fac = polyWdt / 2.0 / 111000.0;
  var poly_pos = posShft / 111000.0;

  var rd1 = parseInt(rgb_min.slice(1, 3), 16);
  var gd1 = parseInt(rgb_min.slice(3, 5), 16);
  var bd1 = parseInt(rgb_min.slice(5, 7), 16);
  var rd2 = parseInt(rgb_max.slice(1, 3), 16);
  var gd2 = parseInt(rgb_max.slice(3, 5), 16);
  var bd2 = parseInt(rgb_max.slice(5, 7), 16);

  var trpHex = dec_to_hex( Math.floor((trp-100)/100*255) );

  var data_num = sheet.getRange(2, 3).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() -1;
  var lon_ar = sheet.getRange(2, 2, data_num).getValues();
  var lat_ar = sheet.getRange(2, 1, data_num).getValues();
  var val_ar = sheet.getRange(2, 3, data_num).getValues();

  var lon = Array.prototype.concat.apply([],lon_ar);
  var lat = Array.prototype.concat.apply([],lat_ar);
  var val = Array.prototype.concat.apply([],val_ar);

  var lon = lon.filter(checkEmpty);
  var lat = lat.filter(checkEmpty);
  var val = val.filter(checkEmpty);

  if(val.length == 0){
    Browser.msgBox('データがありません。\\n実行をキャンセルしました。');
    return ;
  }

  var val_min = get_min(val);
  var val_max = get_max(val);

  var lon_av = get_average(lon);
  var lat_av = get_average(lat);
  var lon_min = get_min(lon);
  var lon_max = get_max(lon);
  var lat_min = get_min(lat);
  var lat_max = get_max(lat);
  var lon_range = 3.0 * ( lon_max - lon_min ) * 111000.0 * Math.cos( Math.abs(lat_av) * Math.PI / 180.0 );
  var lat_range = 3.0 * ( lat_max - lat_min ) * 111000.0;
  var v_range = 100.0;
  if(lon_range > lat_range){
    v_range = lon_range;
  }else{
    v_range = lat_range;
  }

  var head_kml = 
`<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://earth.google.com/kml/2.1">
<Document>
<name>Plot</name>
<open>1</open>
<LookAt>
<longitude>` + lon_av.toString() + `</longitude>
<latitude>` + lat_av.toString() + `</latitude>
<altitude>0</altitude>
<heading>0</heading>
<tilt>0</tilt>
<range>` + v_range.toString() + `</range>
<gx:altitudeMode>relativeToSeaFloor</gx:altitudeMode>
</LookAt>
<Folder>
<name>Graph</name>
`;

  var data_kml = 
`</Folder>
<Folder>
<name>Values</name>
`;

  var foot_kml = 
`</Folder>
</Document>
</kml>
`;

  var poly_kml;
  var poly_each;
  for(var i=0; i<val.length; i++){
    var loni = Number(lon[i]);
    var lati = Number(lat[i]);
    var vali = Number(val[i]);
    
    poly_each = '';

    if(val_max == val_min){
      var rd = rd2;var gd = gd2; var bd = bd2;
    }else{
      var rd = Math.floor( rd1+(vali-val_min)/(val_max-val_min)*(rd2-rd1) );
      var gd = Math.floor( gd1+(vali-val_min)/(val_max-val_min)*(gd2-gd1) );
      var bd = Math.floor( bd1+(vali-val_min)/(val_max-val_min)*(bd2-bd1) );
    }


    var rr = dec_to_hex(rd);
    var gg = dec_to_hex(gd);
    var bb = dec_to_hex(bd);

    if(Math.abs(lati) > 89.0){
      var lon1 = loni - poly_fac;
      var lon2 = loni + poly_fac;
    }else{
      var lon1 = loni - poly_fac / Math.cos( Math.abs(lati) * Math.PI / 180.0 );
      var lon2 = loni + poly_fac / Math.cos( Math.abs(lati) * Math.PI / 180.0 );
    }

    

    var lat1 = lati - poly_fac + poly_pos;
    var lat2 = lati + poly_fac + poly_pos;
    var val0 = ( vali - hgtBias ) * hgtFact;

    sheet.getRange('D'+(i+2)).setValue(val0);
    sheet.getRange('D'+(i+2)).setBackgroundRGB(rd,gd,bd);

    var poly_each = `<Placemark>
<Style>
<LineStyle>
<color>00ffffff</color>
</LineStyle>
<PolyStyle>
<color>` + trpHex + bb + gg + rr + `</color>
<outline>1</outline>
</PolyStyle>
</Style>
<Polygon>
<extrude>1</extrude>
<altitudeMode>relativeToGround</altitudeMode>
<outerBoundaryIs>
<LinearRing>
<coordinates>
` + lon1.toString() + `,` + lat1.toString() + `,` + val0.toString() +`
` + lon1.toString() + `,` + lat2.toString() + `,` + val0.toString() +`
` + lon2.toString() + `,` + lat2.toString() + `,` + val0.toString() +`
` + lon2.toString() + `,` + lat1.toString() + `,` + val0.toString() +`
` + lon1.toString() + `,` + lat1.toString() + `,` + val0.toString() +`
</coordinates>
</LinearRing>
</outerBoundaryIs>
</Polygon>
</Placemark>`;

    var poly_kml = poly_kml + poly_each;

  }

  var value_kml = '';
  var value_each_kml = '';
  for(var i=0; i<val.length; i++){
    var loni = Number(lon[i]);
    var lati = Number(lat[i]);
    var vali = Number(val[i]);

    var lon1 = loni;
    var lat1 = lati + poly_pos;
    var val_num = vali;
    var val0 = ( vali-hgtBias ) * hgtFact * 1.1;

    var value_each_kml = `<Placemark>
<name>` + val_num.toString() + `</name>
<Style>
<IconStyle>
<Icon>
</Icon>
</IconStyle>
<LabelStyle>
<color>ff00ffff</color>
<scale>0.7</scale>
</LabelStyle>
</Style>
<Point>
<altitudeMode>relativeToGround</altitudeMode>
<coordinates>` + lon1.toString() + `,` + lat1.toString() + `,` + val0.toString() + `</coordinates>
</Point>
</Placemark>
`;

    var value_kml = value_kml + value_each_kml;

  }

  var kml_all = head_kml + poly_kml + data_kml + value_kml + foot_kml;

  var blob = Utilities.newBlob("", contentType, kml_fn).setDataFromString(kml_all, charSet);
  DriveApp.createFile(blob);

  Browser.msgBox('マイドライブに保存しました\\nファイル名は　' + kml_fn + '　です\\nデータ数は　' + val.length + '個でした');

  if(kml_all.length > 50000){
    sheet_kml.getRange('A1').setValue(kml_all.slice(0,49999));
    Browser.msgBox('データ数が多いため\\nテキストが50000字を超えました\\nこのツールでは一部のKMLテキストのみ表示できます\\nテキストの全部はドライブに保存したファイルで確認できます');
  }else{
    sheet_kml.getRange('A1').setValue(kml_all);
  }

}

function get_max(array) {
  var max = array[0];
  for(var i=0; i<array.length; i++){
    if(max < array[i]){
      max = array[i];
    }
  }
  return max;
}

function get_min(array) {
  var min = array[0];
  for(var i=0; i<array.length; i++){
    if(min > array[i]){
      min = array[i];
    }
  }
  return min;
}

function get_average(array) {
  var sum =0;
  for(var i=0; i<array.length; i++){
    sum = sum + Number(array[i]);
  }
  return sum/array.length;
}

function dec_to_hex(dec_num){
  return ('00' + dec_num.toString(16)).slice(-2);
}

function kml_look(){
  var sheet_kml = SpreadsheetApp.getActive().getSheetByName('kml');

  if(sheet_kml.getRange('A1').getValue() == ''){
    Browser.msgBox('まだKMLテキストを生成していません');
    return ;
  }

  sheet_kml.activate();

  var msg ="シートを移動しました" ;
  var title = "KMLテキスト" ;
  var sec = 5 ;

  SpreadsheetApp.getActiveSpreadsheet().toast(msg,title, sec);

}


function DataClear(){
  var sheet = SpreadsheetApp.getActive().getSheetByName('Polygon');
  var data_num = sheet.getRange(2, 3).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() -1;
  var sheet_kml = SpreadsheetApp.getActive().getSheetByName('kml');

  sheet.getRange(2, 1, data_num).clear();
  sheet.getRange(2, 2, data_num).clear();
  sheet.getRange(2, 3, data_num).clear();
  sheet.getRange(2, 4, data_num).clear();
  sheet_kml.clear();

}

function checkEmpty(element) {
  return element !== undefined && element !== '' && element !== null;
}

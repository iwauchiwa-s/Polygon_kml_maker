#!/usr/bin/perl
# main program starts here
########### You can change these settings if you need ###############
## Polygon style parameters (bias, factor, width) should be changed 
##           depending on your data.
# File names
my $data_fn = "ge_data.csv"; # input data file
my $kml_fn = "polygon.kml"; # output kml file

# Polygon style parameters
my $hgtBias = 0; # bias for data values
my $hgtFact = 5; # factor for polygon height
#  (polygon height[m] = ( value - bias ) * factor
my $polyWdt = 100; # width of polygon [m]
my $posShft = 0; # position shift [m]

# Polygon colors for min, max and transparency
my $rgb_min = "0000ff"; #hex of r,g,b for minimum value (default=0000ff: blue)
my $rgb_max = "ff0000"; #hex of r,g,b for maximum value (default=ff0000: red)
my $trp = "ff"; #transparency (default=ff: opaque)

#####################################################################

# Constant Pi
my $pi=3.14159265;

my $poly_fac = $polyWdt / 2 / 111000; #half width (meter to deg.)
my $poly_pos = $posShft / 111000; #position shift (meter to deg.)

# color hex
my $rr1 = substr($rgb_min, 0, 2);
my $gg1 = substr($rgb_min, 2, 2);
my $bb1 = substr($rgb_min, 4, 2);
my $rr2 = substr($rgb_max, 0, 2);
my $gg2 = substr($rgb_max, 2, 2);
my $bb2 = substr($rgb_max, 4, 2);

# hex to decimal
my $rd1 = hex($rr1);
my $gd1 = hex($gg1);
my $bd1 = hex($bb1);
my $rd2 = hex($rr2);
my $gd2 = hex($gg2);
my $bd2 = hex($bb2);

# Open input data file
open(IN,$data_fn) or die "$!";
my @lon; # longitude
my @lat; # latitude
my @val; # value
while(<IN>) {
    chomp($_); # delete LF
    my @buf = split(/,/, $_); # separate data by comma
    push @lon, $buf[0];
    push @lat, $buf[1];
    push @val, $buf[2];
}
close(IN);

# minimum and maximum value (for color setting)
my $val_min = min1( @val );
my $val_max = max1( @val );

# test print
#print "$val_min.\n";
#print "$val_max.\n";

# Initial GE viewpoint
# average, minimum, and maximum of lon and lat
my $lon_av = av1( @lon );
my $lat_av = av1( @lat );
my $lon_min = min1( @lon );
my $lon_max = max1( @lon );
my $lat_min = min1( @lat );
my $lat_max = max1( @lat );
# longitudinal and latitudinal ranges [m]
my $lon_range = 3 * ( $lon_max - $lon_min ) * 111000 * cos( abs($lat_av) * $pi / 180 );
my $lat_range = 3 * ( $lat_max - $lat_min ) * 111000;
my $v_range = 100;
# select larger value for $v_range
if ($lon_range > $lat_range) {
	$v_range = $lon_range;
}else{
	$v_range = $lat_range;
}

# create header kml text with default viewpoint
my $head_kml = 
"<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<kml xmlns=\"http://earth.google.com/kml/2.1\">
<Document>
<name>Plot</name>
<open>1</open>
<LookAt>
<longitude>".$lon_av."</longitude>
<latitude>".$lat_av."</latitude>
<altitude>0</altitude>
<heading>0</heading>
<tilt>0</tilt>
<range>".$v_range."</range>
<gx:altitudeMode>relativeToSeaFloor</gx:altitudeMode>
</LookAt>
<Folder>
<name>Graph</name>
";

# kml text for data folder
my $data_kml = "
</Folder>
<Folder>
<name>Values</name>
";

# footer kml text
my $foot_kml = "
</Folder>
</Document>
</kml>
";

### creating polygon kml

my $poly_kml = ""; # polygon kml initialized
my $poly_each = ""; 

for (my $i = 0; $i <= $#val; $i++){

	$poly_each = ""; # each polygon kml initialized
	
	#Polygon color for each value
	if ($val_max == $val_min){  # if all values are the same, use color for max
	$rd = $rd2;
	$gd = $gd2;
	$bd = $bd2;
	}else{    # else, color numbers will be interpolated depending on their values
	$rd = int ( $rd1 + ( $val[$i] - $val_min ) / ( $val_max - $val_min ) * ( $rd2 - $rd1 ) );
	$gd = int ( $gd1 + ( $val[$i] - $val_min ) / ( $val_max - $val_min ) * ( $gd2 - $gd1 ) );
	$bd = int ( $bd1 + ( $val[$i] - $val_min ) / ( $val_max - $val_min ) * ( $bd2 - $bd1 ) );
	}

	#decimal to hex
	$rr = sprintf "%02x", $rd;
	$gg = sprintf "%02x", $gd;
	$bb = sprintf "%02x", $bd;
	

	#Polygon structure
	#4 positions (lon&lat [deg.]) are defined for polygon
	if (abs($lat[$i]) > 89) {  # eliminate north and south poles
		$lon1 = $lon[$i] - $poly_fac;
		$lon2 = $lon[$i] + $poly_fac;
	} else {    # longitudinal width should be corrected for the latitudinal effect
		$lon1 = $lon[$i] - $poly_fac / cos( abs($lat[$i]) * $pi / 180 );
		$lon2 = $lon[$i] + $poly_fac / cos( abs($lat[$i]) * $pi / 180 );
	}
	$lat1 = $lat[$i] - $poly_fac + $poly_pos;
	$lat2 = $lat[$i] + $poly_fac + $poly_pos;
	$val0 = ( $val[$i] - $hgtBias ) * $hgtFact; # polygon height calculation

	#output each polygon kml
	$poly_each ="
<Placemark>
<Style>
<LineStyle>
<color>00ffffff</color>
</LineStyle>
<PolyStyle>
<color>".$trp.$bb.$gg.$rr."</color>
<outline>1</outline>
</PolyStyle>
</Style>
<Polygon>
<extrude>1</extrude>
<altitudeMode>relativeToGround</altitudeMode>
<outerBoundaryIs>
<LinearRing>
<coordinates>\n"
.$lon1.",".$lat1.",".$val0."\n"
.$lon1.",".$lat2.",".$val0."\n"
.$lon2.",".$lat2.",".$val0."\n"
.$lon2.",".$lat1.",".$val0."\n"
.$lon1.",".$lat1.",".$val0."\n
</coordinates>
</LinearRing>
</outerBoundaryIs>
</Polygon>
</Placemark>
" ;

	# accumulate poly_each_kml to poly_kml
	$poly_kml = $poly_kml.$poly_each;
}  # end of for-loop


### creating value kml

my $value_kml = ""; # value kml initialized
my $value_each_kml = ""; 

for (my $i = 0; $i <= $#val; $i++){

	$value_each_kml = ""; # each value kml initialized

	# position of value display
	$lon1 = $lon[$i];
	$lat1 = $lat[$i] + $poly_pos;
	$val_num = $val[$i];
	$val0 = ( $val[$i] - $hgtBias ) * $hgtFact * 1.1; # slightly higher than the top of polygon
	
	$value_each_kml = "
<Placemark>
<name>".$val_num."</name>
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
<coordinates>".$lon1.",".$lat1.",".$val0."</coordinates>
</Point>
</Placemark>
";

	# accumulate value_each_kml to value_kml
	$value_kml = $value_kml.$value_each_kml;
}  # end of for-loop


### Output all KML file
open(FH,"> $kml_fn");

print FH $head_kml;
print FH $poly_kml;
print FH $data_kml;
print FH $value_kml;
print FH $foot_kml;
close(FH);

######## end of main program  #########

# subroutine for max value
sub max1 {
    my $max = shift;    #first data
    foreach(@_){
        $max = $_ if( $max < $_ );    #replace with larger value
    }
    return( $max );
}

# subroutine for min value
sub min1 {
    my $min = shift;    #first data
    foreach(@_){
        $min = $_ if( $min > $_ );    #replace with smaller value
    }
    return( $min );
}

# subroutine for average value
sub av1 {
    my $av = 0;    #integration variable
    foreach(@_){
	$av = $av + $_;  #integrate
    }
    my $num = @_;        #number of elements
    $av = $av / $num;    #average
    return( $av );
}

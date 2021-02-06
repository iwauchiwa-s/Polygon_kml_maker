#!/usr/bin/python
# coding: UTF-8

# main program starts here

import math  # standard module

########### You can change these settings if you need ###############
## Polygon style parameters (bias, factor, width) should be changed 
##           depending on your data.
# File names
data_fn = "ge_data.csv" # input data file
kml_fn = "polygon.kml" # output kml file

# Polygon style parameters
hgtBias = 0.0 # bias for data values
hgtFact = 5.0 # factor for polygon height
#  (polygon height[m] = ( value - bias ) * factor
polyWdt = 100.0 # width of polygon [m]
posShft = 0.0 # position shift [m]

# Polygon colors for min, max and transparency
rgb_min = "0000ff" #hex of r,g,b for minimum value (default=0000ff: blue)
rgb_max = "ff0000" #hex of r,g,b for maximum value (default=ff0000: red)
trp = "ff" #transparency (default=ff: opaque)

#####################################################################

poly_fac = polyWdt / 2.0 / 111000.0 #half width (meter to deg.)
poly_pos = posShft / 111000.0 #position shift (meter to deg.)

# color hex
rr1 = rgb_min[0:2]
gg1 = rgb_min[2:4]
bb1 = rgb_min[4:6]
rr2 = rgb_max[0:2]
gg2 = rgb_max[2:4]
bb2 = rgb_max[4:6]

# hex to decimal
rd1 = int(rr1, 16)
gd1 = int(gg1, 16)
bd1 = int(bb1, 16)
rd2 = int(rr2, 16)
gd2 = int(gg2, 16)
bd2 = int(bb2, 16)

# Open input data file
lon = list(range(0))  # longitude
lat = list(range(0))  # latitude
val = list(range(0))  # value

f = open(data_fn, 'r')
while True:
  data = f.readline()
  data.rstrip('\n')  # remove LF
  if data == '':
    break
  l = [float(x.strip()) for x in data.split(',')]  # separate data by comma as numerical format
  lon = lon + [l[0]]
  lat = lat + [l[1]]
  val = val + [l[2]]
f.close()


# minimum and maximum value (for color setting)
val_min = min( val )
val_max = max( val )

# test print
#print(val_min)
#print(val_max)

# Initial GE viewpoint
# average, minimum, and maximum of lon and lat
lon_av = sum( lon ) / len( lon )
lat_av = sum( lat ) / len( lat )
lon_min = min( lon )
lon_max = max( lon )
lat_min = min( lat )
lat_max = max( lat )
# longitudinal and latitudinal ranges [m]
lon_range = 3.0 * ( lon_max - lon_min ) * 111000.0 * math.cos( abs(lat_av) * math.pi / 180.0 )
lat_range = 3.0 * ( lat_max - lat_min ) * 111000.0
v_range = 100.0
# select larger value for v_range
if lon_range > lat_range:
  v_range = lon_range
else:
  v_range = lat_range


# create header kml text with default viewpoint
head_kml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
  '<kml xmlns="http://earth.google.com/kml/2.1">\n'
  '<Document>\n'
  '<name>Plot</name>\n'
  '<open>1</open>\n'
  '<LookAt>\n'
  '<longitude>' + str(lon_av) + '</longitude>\n'
  '<latitude>' + str(lat_av) + '</latitude>\n'
  '<altitude>0</altitude>\n'
  '<heading>0</heading>\n'
  '<tilt>0</tilt>\n'
  '<range>' + str(v_range) + '</range>\n'
  '<gx:altitudeMode>relativeToSeaFloor</gx:altitudeMode>\n'
  '</LookAt>\n'
  '<Folder>\n'
  '<name>Graph</name>\n')

# kml text for data folder
data_kml = ('</Folder>\n'
  '<Folder>\n'
  '<name>Values</name>\n')

# footer kml text
foot_kml = ('</Folder>\n'
  '</Document>\n'
  '</kml>\n')

### creating polygon kml

poly_kml = '' # polygon kml initialized
poly_each = '' 

for loni, lati, vali in zip(lon, lat, val):

  poly_each = '' # each polygon kml initialized
	
  #Polygon color for each value
  if val_max == val_min :  # if all values are the same, use color for max
    rd = rd2
    gd = gd2
    bd = bd2
  else :    # else, color numbers will be interpolated depending on their values
    rd = int ( rd1 + ( vali - val_min ) / ( val_max - val_min ) * ( rd2 - rd1 ) )
    gd = int ( gd1 + ( vali - val_min ) / ( val_max - val_min ) * ( gd2 - gd1 ) )
    bd = int ( bd1 + ( vali - val_min ) / ( val_max - val_min ) * ( bd2 - bd1 ) )

  #decimal to hex
  rr = format(rd, '02x')
  gg = format(gd, '02x')
  bb = format(bd, '02x')

  #Polygon structure
  #4 positions (lon&lat [deg.]) are defined for polygon
  if abs(lati) > 89.0 :  # eliminate north and south poles
    lon1 = loni - poly_fac
    lon2 = loni + poly_fac
  else :    # longitudinal width should be corrected for the latitudinal effect
    lon1 = loni - poly_fac / math.cos( abs(lati) * math.pi / 180.0 )
    lon2 = loni + poly_fac / math.cos( abs(lati) * math.pi / 180.0 )

  lat1 = lati - poly_fac + poly_pos
  lat2 = lati + poly_fac + poly_pos
  val0 = ( vali - hgtBias ) * hgtFact # polygon height calculation

  #output each polygon kml
  poly_each =('<Placemark>\n'
    '<Style>\n'
    '<LineStyle>\n'
    '<color>00ffffff</color>\n'
    '</LineStyle>\n'
    '<PolyStyle>\n'
    '<color>' + trp + bb + gg + rr + '</color>\n'
    '<outline>1</outline>\n'
    '</PolyStyle>\n'
    '</Style>\n'
    '<Polygon>\n'
    '<extrude>1</extrude>\n'
    '<altitudeMode>relativeToGround</altitudeMode>\n'
    '<outerBoundaryIs>\n'
    '<LinearRing>\n'
    '<coordinates>\n'
    + str(lon1) + ',' + str(lat1) + ',' + str(val0) + '\n'
    + str(lon1) + ',' + str(lat2) + ',' + str(val0) + '\n'
    + str(lon2) + ',' + str(lat2) + ',' + str(val0) + '\n'
    + str(lon2) + ',' + str(lat1) + ',' + str(val0) + '\n'
    + str(lon1) + ',' + str(lat1) + ',' + str(val0) + '\n'
    '</coordinates>\n'
    '</LinearRing>\n'
    '</outerBoundaryIs>\n'
    '</Polygon>\n'
    '</Placemark>\n')

  # accumulate poly_each_kml to poly_kml
  poly_kml = poly_kml + poly_each
# end of for-loop


### creating value kml

value_kml = '' # value kml initialized
value_each_kml = '' 

for loni, lati, vali in zip(lon, lat, val):

  value_each_kml = '' # each value kml initialized

  # position of value display
  lon1 = loni
  lat1 = lati + poly_pos
  val_num = vali
  val0 = ( vali - hgtBias ) * hgtFact * 1.1 # slightly higher than the top of polygon

  value_each_kml = ('<Placemark>\n'
    '<name>' + str(val_num) + '</name>\n'
    '<Style>\n'
    '<IconStyle>\n'
    '<Icon>\n'
    '</Icon>\n'
    '</IconStyle>\n'
    '<LabelStyle>\n'
    '<color>ff00ffff</color>\n'
    '<scale>0.7</scale>\n'
    '</LabelStyle>\n'
    '</Style>\n'
    '<Point>\n'
    '<altitudeMode>relativeToGround</altitudeMode>\n'
    '<coordinates>' + str(lon1) +',' + str(lat1) + ',' + str(val0) + '</coordinates>\n'
    '</Point>\n'
    '</Placemark>\n')

  # accumulate value_each_kml to value_kml
  value_kml = value_kml + value_each_kml
# end of for-loop


### Output all KML file
# all kml text
kml_all = head_kml + poly_kml + data_kml + value_kml + foot_kml

with open(kml_fn, mode='w') as f:
  f.write(kml_all)

######## end of main program  #########


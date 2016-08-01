# Phonegap_base_app
Base PhoneGAP app to provide camera use, GPS access, geolocation, QR codes, etc.

## Overview
Many mobile apps require the same, modular, reusable functionality.  To that end, I have created a file called core.js that holds most of the code needed to provide the following functionality:
* GPS
* Compass access
* LBS
* geolocation/store locator
* Camera accessibility
* QR code interaction
* file uploading
* zipping files
* push notifications
* PushWoosh sending
* creation of a background service (which needs code clean up)

This code is to be used as a skeleton to create your own application.

## Folder structure
The folder structure is defined as follows:
* www - folder that holds the PhoneGap mobile application code
* server - PHP based server side code for
** registering and sending Push notifications
** handling geolocation lookups
* extra - a catch all folder for things that will be integrated into the previous two folders

## TODO
Most code is incomplete without much error checking.  The reason being is that I wanted people to be able to read the code quickly and get a core understanding of how to use such functionality.

If I have availability, I will add more error checking and extra features.

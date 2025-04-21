import React from 'react';
import { Marker } from 'react-native-maps';  // Make sure you have react-native-maps installed

function MapMarker({ location, onPress }) {
  return (
    <Marker
      coordinate={{ latitude: location.latitude, longitude: location.longitude }}
      title={location.name}
      onPress={onPress} // Handle marker press to show more info
    />
  );
}

export default MapMarker;
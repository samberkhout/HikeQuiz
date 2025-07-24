import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapLegend({ isVisible = true }) {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Legend</Text>
      
      <View style={styles.legendItem}>
        <View style={[styles.line, { backgroundColor: '#4CAF50', height: 4 }]} />
        <Text style={styles.legendText}>Real Walking Route (OpenRouteService)</Text>
      </View>
      
      <View style={styles.legendItem}>
        <View style={[styles.line, { backgroundColor: '#1976D2' }]} />
        <Text style={styles.legendText}>Smart Route (Fallback)</Text>
      </View>
      
      <View style={styles.legendItem}>
        <View style={[styles.line, { backgroundColor: '#2196F3' }]} />
        <Text style={styles.legendText}>Simple Route</Text>
      </View>
      
      <View style={styles.legendItem}>
        <View style={[styles.dashedLine]} />
        <Text style={styles.legendText}>Full Trail</Text>
      </View>
      
      <View style={styles.markerLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.marker, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Start</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.marker, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.legendText}>Checkpoint</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.marker, { backgroundColor: '#9C27B0' }]} />
          <Text style={styles.legendText}>You</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  line: {
    width: 20,
    height: 3,
    marginRight: 8,
    borderRadius: 1.5,
  },
  dashedLine: {
    width: 20,
    height: 3,
    marginRight: 8,
    backgroundColor: '#CCCCCC',
    borderRadius: 1.5,
    opacity: 0.8,
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  markerLegend: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
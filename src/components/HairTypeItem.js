import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const HairTypeItem = ({ name }) => {
  return (
    <View style={styles.listItem}>
      <Text style={styles.listText}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    padding: 15,
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listText: {
    fontSize: 16,
    color: theme.colors.text,
  },
});

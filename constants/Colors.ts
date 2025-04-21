// constants/Colors.js
const tintColorLight = '#2962FF'; // Vibrant Blue
const tintColorDark = '#448AFF'; // Brighter Blue

const light = {
  text: '#1A1A1A', // Dark Gray
  background: '#F5F7FA', // Soft White
  cardBackground: '#FFFFFF',
  tint: tintColorLight,
  secondary: '#757575', // Medium Gray
  border: '#E0E0E0', // Light Gray
  success: '#2E7D32', // Green
  danger: '#D32F2F', // Red
  placeholder: '#B0B0B0', // Gray
  gradient: ['#4FC3F7', '#0288D1'], // Blue Gradient
};

const dark = {
  text: '#E0E0E0', // Light Gray
  background: '#121212', // Dark Gray
  cardBackground: '#1E1E1E', // Darker Gray
  tint: tintColorDark,
  secondary: '#B0B0B0', // Light Gray
  border: '#424242', // Medium Gray
  success: '#4CAF50', // Green
  danger: '#F44336', // Red
  placeholder: '#616161', // Dark Gray
  gradient: ['#1976D2', '#1565C0'], // Dark Blue Gradient
};

export const Colors = {
  light,
  dark,
  white: '#FFFFFF',
  black: '#000000',
};
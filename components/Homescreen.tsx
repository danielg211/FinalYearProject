import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

// HomeScreen component serves as the welcome screen for the app
// This code is adapted from Zero Degree Coder's video on creating a Signup, Login, and Welcome Screen in React Native
// Video reference: Zero Degree Coder. "Signup, Login, Welcome Screen React Native." YouTube, https://www.youtube.com/watch?v=eu-8OlWbwjA

const HomeScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      {/* Display the app logo */}
      <Image source={require("../assets/Logo.png")} style={styles.logo} />
      
      {/* Title text to welcome the user */}
      <Text style={styles.title}>Elevate Your Game</Text>
      
      {/* Container for the user type buttons (PGA Pro and Golfer) */}
      <View style={styles.buttonContainer}>
        {/* Button to navigate to the PGA Pro authentication screen */}
        <TouchableOpacity
          style={[styles.buttonWrapper, styles.PGAButtonWrapper]}
          onPress={() => navigation.navigate("Auth", { userType: "PGA" })}
        >
          <Text style={styles.buttonText}>PGA Pro</Text>
        </TouchableOpacity>

        {/* Button to navigate to the Golfer authentication screen */}
        <TouchableOpacity
          style={[styles.buttonWrapper, styles.GolferButtonWrapper]}
          onPress={() => navigation.navigate("GolferAuth")}
        >
          <Text style={styles.buttonText}>Golfer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

// Define the styles used in the HomeScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light background color for the screen
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    height: 60, // Height of the logo image
    width: 180, // Width of the logo image
    marginVertical: 20, // Vertical margin around the logo
  },
  title: {
    fontSize: 28, // Large font size for the title text
    fontWeight: 'bold', // Bold text style
    textAlign: 'center', // Center align the text
    color: '#333333', // Dark gray color for the title
    marginBottom: 30, // Margin below the title
  },
  buttonContainer: {
    flexDirection: "row", // Arrange buttons in a row
    width: "100%", // Full width of the container
    justifyContent: "space-between", // Space out buttons evenly
    marginTop: 20, // Margin above the button container
  },
  buttonWrapper: {
    flex: 1, // Each button takes equal space
    justifyContent: "center", // Center text vertically within button
    alignItems: "center", // Center text horizontally within button
    paddingVertical: 15, // Padding around the button text
    marginHorizontal: 5, // Horizontal margin between buttons
    borderRadius: 10, // Rounded corners for the buttons
  },
  PGAButtonWrapper: {
    backgroundColor: '#007f00', // Green color for PGA Pro button
  },
  GolferButtonWrapper: {
    backgroundColor: '#004d00', // Darker green color for Golfer button
  },
  buttonText: {
    color: '#FFFFFF', // White text color for button text
    fontSize: 18, // Font size for button text
    fontWeight: 'bold', // Bold text style
    textTransform: 'uppercase', // Convert text to uppercase
  },
});

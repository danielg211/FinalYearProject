import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

// HomeScreen component serves as the welcome screen for the app.
const HomeScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      {/* Display the app logo */}
      <Image source={require("../assets/Logo.png")} style={styles.logo} />

      {/* Title text to welcome the user */}
      <Text style={styles.title}>Elevate Your Game</Text>

      {/* Subtitle to provide further context */}
      <Text style={styles.subtitle}>Choose your role to log in</Text>

      {/* Container for the user type buttons (PGA Pro and Golfer) */}
      <View style={styles.buttonContainer}>
        {/* Button to navigate to the PGA Pro authentication screen */}
        <TouchableOpacity
          style={[styles.buttonWrapper, styles.PGAButtonWrapper]}
          onPress={() => navigation.navigate("PGALogin")}
          accessibilityLabel="PGA Professional Login"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>PGA Professional</Text>
        </TouchableOpacity>

        {/* Button to navigate to the Golfer authentication screen */}
        <TouchableOpacity
          style={[styles.buttonWrapper, styles.GolferButtonWrapper]}
          onPress={() => navigation.navigate("GolferLogin")}
          accessibilityLabel="Golfer Login"
          accessibilityRole="button"
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
    backgroundColor: '#f5f5f5', // Light background color
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 40, // Adjust for devices with notches
  },
  logo: {
    height: 80, // Larger logo
    width: 200,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#555555",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "column", // Buttons now stack vertically
    width: "100%",
    alignItems: "center",
  },
  buttonWrapper: {
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10, // Add spacing between buttons
  },
  PGAButtonWrapper: {
    backgroundColor: "#007f00", // Green for PGA Pro button
  },
  GolferButtonWrapper: {
    backgroundColor: "#004d00", // Darker green for Golfer button
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
